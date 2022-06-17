import { openDB } from "idb";
import {
  PubSubChannel,
  ReqRepChannel,
} from "browser-message-broker";
import {
  IModifyTodo,
  ITodo,
  ITodoErr,
  MESSAGES,
} from "./Messages";

const errChannel = PubSubChannel.getOrCreate<ITodoErr>(
  MESSAGES.TODO_ERR,
  {
    enableBroadcast: true,
    enableCaching: false,
  }
);

const todoAddedChannel = PubSubChannel.getOrCreate<ITodo>(
  MESSAGES.TODO_ADDED,
  {
    enableBroadcast: true,
    enableCaching: false, //in order to avoid publishing this state to remote brokers on sync
  }
);

const todoDeletedChannel = PubSubChannel.getOrCreate<ITodo>(
  MESSAGES.TODO_DELETED,
  { enableBroadcast: true, enableCaching: false }
);
const todoModifiedChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.TODO_MODIFIED, {
    enableBroadcast: true,
    enableCaching: false,
  });

const dbProm = openDB("Todos", 1, {
  upgrade(db) {
    const store = db.createObjectStore("todo", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("isDone", "isDone");
  },
});

PubSubChannel.getOrCreate<Partial<ITodo>>(
  MESSAGES.ADD_TODO,
  { enableBroadcast: true, enableCaching: false }
).subscribe(handleAddTodo);

PubSubChannel.getOrCreate<ITodo>(MESSAGES.COMPLETE_TODO, {
  enableBroadcast: true,
  enableCaching: false,
}).subscribe(handleCompleteTodo);

PubSubChannel.getOrCreate<ITodo>(MESSAGES.DEL_TODO, {
  enableBroadcast: true,
  enableCaching: false,
}).subscribe(handleDeleteTodo);

PubSubChannel.getOrCreate<IModifyTodo>(
  MESSAGES.MODIFY_TODO,
  {
    enableBroadcast: true,
    enableCaching: false,
  }
).subscribe(handleModifyTodo);

ReqRepChannel.getOrCreate<undefined>(
  MESSAGES.GET_ALL_TODOS,
  {
    enableBroadcast: true,
  }
).reply(handleGetAllTodos);

async function handleGetAllTodos(_: undefined) {
  try {
    const db = await dbProm;
    const todos = (await db.getAll("todo")) as ITodo[];
    return todos;
  } catch (err) {
    console.log(err);
    errChannel.send({
      message: `Can't get all todos`,
      context: {},
    });
  }
  return undefined;
}

async function handleModifyTodo(msg: IModifyTodo) {
  try {
    const db = await dbProm;
    const todo = (await db.get("todo", msg.id)) as ITodo;
    todo.text = msg.newText;
    await db.put("todo", todo);
    todoModifiedChannel.send(todo);
  } catch {
    errChannel.send({
      message: `Can't modify todo. Change: text = '${msg.newText}'`,
      context: { id: msg.id },
    });
  }
}

async function handleDeleteTodo(todo: ITodo) {
  try {
    const db = await dbProm;
    await db.delete("todo", todo.id);
    todoDeletedChannel.send(todo);
  } catch {
    errChannel.send({
      message: "Can't delete todo",
      context: todo,
    });
  }
}

async function handleCompleteTodo(todo: ITodo) {
  try {
    const db = await dbProm;
    await db.put("todo", { ...todo, isDone: true });
    todo.isDone = true;
    todoModifiedChannel.send(todo);
  } catch {
    errChannel.send({
      message: "Can't complete todo",
      context: todo,
    });
  }
}

async function handleAddTodo(todo: Partial<ITodo>) {
  if (!todo.text || todo.text === "") {
    errChannel.send({
      context: todo,
      message: "Can't add todo without text",
    });
    return;
  }
  const newTodo: Partial<ITodo> = {
    text: todo.text,
    isDone: false,
  };

  try {
    const db = await dbProm;
    const key = (await db.add("todo", newTodo)) as number;
    newTodo.id = key;
    todoAddedChannel.send(newTodo as ITodo);
  } catch (err) {
    errChannel.send({
      message: "Can't add todo. ",
      context: todo,
    });
  }
}

PubSubChannel.getOrCreate(MESSAGES.DATA_SOURCE_READY, {
  enableBroadcast: true,
  enableCaching: true,
}).send(true);
