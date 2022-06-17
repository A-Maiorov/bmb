import {
  PubSubChannel,
  ReqRepChannel,
  Disposer,
} from "browser-message-broker";
import { ReactiveController } from "lit";
import { ITodo, MESSAGES } from "./Messages";
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

    this.disposeTodoAdded =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_ADDED,
        {
          enableBroadcast: true,
          enableCaching: false,
        }
      ).subscribe(this.onTodoAdded.bind(this));

    this.disposeTodoModified =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_MODIFIED,
        {
          enableBroadcast: true,
          enableCaching: false,
        }
      ).subscribe(this.onTodoModified.bind(this));

    this.disposeTodoDeleted =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_DELETED,
        {
          enableBroadcast: true,
          enableCaching: false,
        }
      ).subscribe(this.onTodoDeleted.bind(this));
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
    PubSubChannel.broadcast(MESSAGES.COMPLETE_TODO, t);
  }

  deleteTodo(t: ITodo) {
    PubSubChannel.broadcast(MESSAGES.DEL_TODO, t);
  }

  selectTodo(t: ITodo) {
    PubSubChannel.broadcast(MESSAGES.TODO_SELECTED, t);
  }

  async hostConnected() {
    const dsIsReady = PubSubChannel.GetState<boolean>(
      MESSAGES.DATA_SOURCE_READY
    );
    if (!dsIsReady)
      await PubSubChannel.nextMessage(
        MESSAGES.DATA_SOURCE_READY
      );

    const todos = await ReqRepChannel.getOrCreate<
      undefined,
      ITodo[]
    >(MESSAGES.GET_ALL_TODOS, {
      enableBroadcast: true,
    }).request(undefined);

    this.host.allTodos = todos || [];
  }

  hostDisconnected() {
    this.disposeTodoAdded();
    this.disposeTodoModified();
    this.disposeTodoDeleted();
  }
}
