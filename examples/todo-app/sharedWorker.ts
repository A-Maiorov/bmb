import { openDB } from "idb";
import {
  addTodoChannel,
  completeTodoChannel,
  delTodoChannel,
  dsReadyChannel,
  getAllTodosChannel,
  IModifyTodo,
  ITodo,
  modifyTodoChannel,
  todoAddedChannel,
  todoDeletedChannel,
  todoErrChannel,
  todoModifiedChannel,
} from "./Channels";

const dbProm = openDB("Todos", 1, {
  upgrade(db) {
    const store = db.createObjectStore("todo", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("isDone", "isDone");
  },
});

addTodoChannel.subscribe(handleAddTodo);

completeTodoChannel.subscribe(handleCompleteTodo);

delTodoChannel.subscribe(handleDeleteTodo);

modifyTodoChannel.subscribe(handleModifyTodo);

getAllTodosChannel.reply(handleGetAllTodos);

async function handleGetAllTodos(_: undefined) {
  try {
    const db = await dbProm;
    const todos = (await db.getAll("todo")) as ITodo[];
    return todos;
  } catch (err) {
    console.log(err);
    todoErrChannel.send({
      message: `Can't get all todos`,
      context: {},
    });
  }
  return Promise.resolve([]);
}

async function handleModifyTodo(msg: IModifyTodo) {
  try {
    const db = await dbProm;
    const todo = (await db.get("todo", msg.id)) as ITodo;
    todo.text = msg.newText;
    await db.put("todo", todo);
    todoModifiedChannel.send(todo);
  } catch {
    todoErrChannel.send({
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
    todoErrChannel.send({
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
    todoErrChannel.send({
      message: "Can't complete todo",
      context: todo,
    });
  }
}

async function handleAddTodo(todo: Partial<ITodo>) {
  if (!todo.text || todo.text === "") {
    todoErrChannel.send({
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
    todoErrChannel.send({
      message: "Can't add todo. ",
      context: todo,
    });
  }
}

dsReadyChannel.send(true);
