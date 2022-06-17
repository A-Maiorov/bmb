import { Disposer } from "browser-message-broker";
import { ReactiveController } from "lit";
import {
  completeTodoChannel,
  delTodoChannel,
  dsReadyChannel,
  getAllTodosChannel,
  ITodo,
  todoAddedChannel,
  todoDeletedChannel,
  todoModifiedChannel,
  todoSelectedChannel,
} from "./Channels";
import type { TodoList } from "./todoList";

export class TodoListController
  implements ReactiveController
{
  private host: TodoList;
  private disposeTodoAdded: Disposer;
  private disposeTodoModified: Disposer;
  private disposeTodoDeleted: Disposer;

  constructor(host: TodoList) {
    this.host = host;
    host.addController(this);

    this.disposeTodoAdded = todoAddedChannel.subscribe(
      this.onTodoAdded.bind(this)
    );

    this.disposeTodoModified =
      todoModifiedChannel.subscribe(
        this.onTodoModified.bind(this)
      );

    this.disposeTodoDeleted = todoDeletedChannel.subscribe(
      this.onTodoDeleted.bind(this)
    );
  }

  onTodoAdded(todo: ITodo) {
    this.host.allTodos.push(todo);
    this.host.requestUpdate();
  }
  onTodoDeleted(todo: ITodo) {
    const ind = this.__findTodoIndex(todo);
    if (ind === -1) return;

    this.host.allTodos.splice(ind, 1);
    this.host.requestUpdate();
  }

  private __findTodoIndex(todo: ITodo) {
    if (!this.host.allTodos) return -1;
    return this.host.allTodos.findIndex(
      (t) => t.id === todo.id
    );
  }

  onTodoModified(todo: ITodo) {
    const ind = this.__findTodoIndex(todo);
    if (ind === -1) return;

    this.host.allTodos[ind] = todo;
    this.host.requestUpdate();
  }

  completeTodo(t: ITodo) {
    completeTodoChannel.send(t);
  }

  deleteTodo(t: ITodo) {
    delTodoChannel.send(t);
  }

  selectTodo(t: ITodo) {
    todoSelectedChannel.send(t);
  }

  async hostConnected() {
    const dsIsReady = dsReadyChannel.getState();

    if (!dsIsReady) await dsReadyChannel.nextMessage();

    const todos = await getAllTodosChannel.request();

    this.host.allTodos = todos || [];
  }

  hostDisconnected() {
    this.disposeTodoAdded();
    this.disposeTodoModified();
    this.disposeTodoDeleted();
  }
}
