import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { SubscriptionController } from "browser-message-broker/dist/LitSubscriptionController";
import { ITodo, MESSAGES } from "./Messages";
import { BMB } from "browser-message-broker";

@customElement("todo-list")
export class TodoList extends LitElement {
  allTodosCtl: SubscriptionController<ITodo[]>;

  completeSubCtl: SubscriptionController<ITodo>;
  deleteSubCtl: SubscriptionController<ITodo>;
  todoSelCtl: SubscriptionController<ITodo>;

  constructor() {
    super();
    this.allTodosCtl = new SubscriptionController<ITodo[]>(
      this,
      MESSAGES.ALL_TODOS,
      true
    );

    new SubscriptionController<ITodo>(
      this,
      MESSAGES.TODO_ADDED,
      true,
      false,
      this.handleTodoAdded.bind(this)
    );

    new SubscriptionController<ITodo>(
      this,
      MESSAGES.TODO_MODIFIED,
      true,
      false,
      this.handleTodoModified.bind(this)
    );

    new SubscriptionController<ITodo>(
      this,
      MESSAGES.TODO_DELETED,
      true,
      false,
      this.handleTodoDeleted.bind(this)
    );

    this.completeSubCtl = new SubscriptionController<ITodo>(
      this,
      MESSAGES.COMPLETE_TODO,
      true
    );

    this.deleteSubCtl = new SubscriptionController<ITodo>(
      this,
      MESSAGES.DEL_TODO,
      true
    );

    // not broadcasted (limited to current context - Window)
    this.todoSelCtl = new SubscriptionController<ITodo>(
      this,
      MESSAGES.TODO_SELECTED
    );

    BMB.nextMessage(MESSAGES.DATA_SOURCE_READY).then(() => {
      BMB.Broadcast(MESSAGES.GET_ALL_TODOS);
    });
  }

  handleTodoAdded(todo: ITodo) {
    this.allTodosCtl.state?.push(todo);
    this.requestUpdate();
  }
  handleTodoDeleted(todo: ITodo) {
    console.log("handleTodoDeleted (in list)");
    if (!this.allTodosCtl.state) return;
    const ind = this.allTodosCtl.state?.findIndex((t) => t.id === todo.id);
    if (ind === -1) return;
    this.allTodosCtl.state.splice(ind, 1);
    this.requestUpdate();
  }
  handleTodoModified(todo: ITodo) {
    console.log("handleTodoModified (in list)");
    if (!this.allTodosCtl.state) return;
    const ind = this.allTodosCtl.state?.findIndex((t) => t.id === todo.id);
    if (ind === -1) return;
    this.allTodosCtl.state[ind] = todo;
    this.requestUpdate();
  }

  completeTodo(t: ITodo) {
    this.completeSubCtl.subscription?.publish(t);
  }

  override render() {
    return html`<div>TO DO:</div>
      <ul>
        ${this.allTodosCtl.state?.map(
          (todo) => html`
            <li ?data-isDone=${todo.isDone}>
              <button
                @click=${() => {
                  this.completeSubCtl.subscription?.publish(todo);
                }}
                class="check"
              >
                ✔
              </button>
              <span
                @click=${() => this.todoSelCtl.subscription?.publish(todo)}
                class="text"
                >${todo.text}</span
              >
              <button
                @click=${() => {
                  this.deleteSubCtl.subscription?.publish(todo);
                }}
                class="delete"
              >
                ❌
              </button>
            </li>
          `
        )}
      </ul>`;
  }

  static override styles = css`
    button {
      padding: 5px;
    }

    li[data-isDone] > .check {
      display: none;
    }

    li[data-isDone] > .check {
      display: none;
    }
    li[data-isDone] > .text {
      text-decoration: line-through;
    }

    .text {
      cursor: pointer;
    }
  `;
}
