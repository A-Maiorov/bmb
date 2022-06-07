import { BMB, Subscription } from "browser-message-broker";
import { ReactiveController } from "lit";
import { ITodo, MESSAGES } from "./Messages";
import type { TodoList } from "./todoList";

export class TodoListController implements ReactiveController {
  private host: TodoList;
  private allTodosSubs: Subscription<ITodo[]>;
  private todoAddedSubs: Subscription<ITodo>;
  private todoModifiedSubs: Subscription<ITodo>;
  private todoDeletedSubs: Subscription<ITodo>;

  constructor(host: TodoList) {
    this.host = host;
    host.addController(this);

    this.allTodosSubs = BMB.Subscribe<ITodo[]>(
      MESSAGES.ALL_TODOS,
      (todos) => {
        this.host.allTodos = todos;
      },
      true,
      true
    );

    this.todoAddedSubs = BMB.Subscribe(
      MESSAGES.TODO_ADDED,
      this.onTodoAdded.bind(this),
      true,
      false
    );

    this.todoModifiedSubs = BMB.Subscribe(
      MESSAGES.TODO_MODIFIED,
      this.onTodoModified.bind(this),
      true,
      false
    );
    this.todoDeletedSubs = BMB.Subscribe(
      MESSAGES.TODO_DELETED,
      this.onTodoDeleted.bind(this),
      true,
      false
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
    return this.host.allTodos.findIndex((t) => t.id === todo.id);
  }

  onTodoModified(todo: ITodo) {
    const ind = this.__findTodoIndex(todo);
    if (ind === -1) return;

    this.host.allTodos[ind] = todo;
    this.host.requestUpdate();
  }

  completeTodo(t: ITodo) {
    BMB.Broadcast(MESSAGES.COMPLETE_TODO, t);
  }

  deleteTodo(t: ITodo) {
    BMB.Broadcast(MESSAGES.DEL_TODO, t);
  }

  selectTodo(t: ITodo) {
    BMB.Broadcast(MESSAGES.TODO_SELECTED, t);
  }

  async hostConnected() {
    const dsIsReady = BMB.GetState<boolean>(MESSAGES.DATA_SOURCE_READY);
    if (!dsIsReady) await BMB.nextMessage(MESSAGES.DATA_SOURCE_READY);

    BMB.Broadcast(MESSAGES.GET_ALL_TODOS);
  }

  hostDisconnected() {
    this.allTodosSubs.dispose();
    this.todoAddedSubs.dispose();
    this.todoModifiedSubs.dispose();
    this.todoDeletedSubs.dispose();
  }
}
