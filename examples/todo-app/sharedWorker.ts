import { openDB } from "idb";
import { BMB } from "browser-message-broker";
import { IModifyTodo, ITodo, ITodoErr, MESSAGES } from "./Messages";

BMB.trace = true;

const errSubscription = BMB.Subscribe<ITodoErr>(
  MESSAGES.TODO_ERR,
  undefined,
  true
);

const addedSubscription = BMB.Subscribe<ITodo>(
  MESSAGES.TODO_ADDED,
  undefined,
  true,
  false //to avoid publishing this state to remote brokers on sync
);
const deletedSubscription = BMB.Subscribe<ITodo>(
  MESSAGES.TODO_DELETED,
  undefined,
  true,
  false
);
const modifiedSubscription = BMB.Subscribe<ITodo>(
  MESSAGES.TODO_MODIFIED,
  undefined,
  true,
  false
);
const allSubscription = BMB.Subscribe<ITodo[]>(
  MESSAGES.ALL_TODOS,
  undefined,
  true,
  false
);

const dbProm = openDB("Todos", 1, {
  upgrade(db) {
    const store = db.createObjectStore("todo", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("isDone", "isDone");
  },
});

BMB.Subscribe(MESSAGES.ADD_TODO, handleAddTodo, true, false);
BMB.Subscribe(MESSAGES.COMPLETE_TODO, handleCompleteTodo, true, false);
BMB.Subscribe(MESSAGES.DEL_TODO, handleDeleteTodo, true, false);
BMB.Subscribe(MESSAGES.MODIFY_TODO, handleModifyTodo, true, false);
BMB.Subscribe(MESSAGES.GET_ALL_TODOS, handleGetAllTodos, true, false);

async function handleGetAllTodos(_: undefined, senderId: string) {
  try {
    const db = await dbProm;
    const todos = (await db.getAll("todo")) as ITodo[];
    allSubscription.publish(todos, senderId);
  } catch (err) {
    console.log(err);
    errSubscription.publish({
      message: `Can't get all todos`,
      context: {},
    });
  }
}

async function handleModifyTodo(msg: IModifyTodo) {
  try {
    const db = await dbProm;
    const todo = (await db.get("todo", msg.id)) as ITodo;
    todo.text = msg.newText;
    await db.put("todo", todo);
    modifiedSubscription.publish(todo);
  } catch {
    errSubscription.publish({
      message: `Can't modify todo. Change: text = '${msg.newText}'`,
      context: { id: msg.id },
    });
  }
}

async function handleDeleteTodo(todo: ITodo) {
  console.log("handleDeleteTodo");
  try {
    const db = await dbProm;
    await db.delete("todo", todo.id);
    deletedSubscription.publish(todo);
  } catch {
    errSubscription.publish({
      message: "Can't delete todo",
      context: todo,
    });
  }
}

async function handleCompleteTodo(todo: ITodo) {
  console.log("handleCompleteTodo");
  try {
    const db = await dbProm;
    await db.put("todo", { ...todo, isDone: true });
    todo.isDone = true;
    modifiedSubscription.publish(todo);
  } catch {
    errSubscription.publish({
      message: "Can't complete todo",
      context: todo,
    });
  }
}

async function handleAddTodo(todo: Partial<ITodo>) {
  console.log("handleAddTodo");
  if (!todo.text || todo.text === "") {
    errSubscription.publish({
      context: todo,
      message: "Can't add todo without text",
    });
    return;
  }
  const newTodo: Partial<ITodo> = { text: todo.text, isDone: false };

  try {
    const db = await dbProm;
    const key = (await db.add("todo", newTodo)) as number;
    newTodo.id = key;
    addedSubscription.publish(newTodo as ITodo);
  } catch (err) {
    errSubscription.publish({
      message: "Can't add todo. ",
      context: todo,
    });
  }
}

BMB.Subscribe(MESSAGES.DATA_SOURCE_READY, undefined, true, false).publish(
  undefined
);
