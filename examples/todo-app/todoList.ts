import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { SubscriptionContorller } from "browser-message-broker/dist/LitSubscriptionContorller";
import { ITodo, MESSAGES } from "./Messages";
import { BMB, Subscription } from "browser-message-broker";

@customElement("todo-list")
export class TodoList extends LitElement {
  allTodosCtl: SubscriptionContorller<ITodo[]>;
  getAlltodos: Subscription<unknown>;
  completeSubCtl: SubscriptionContorller<ITodo>;
  deleteSubCtl: SubscriptionContorller<ITodo>;
  todoSelCtl: SubscriptionContorller<ITodo>;

  constructor() {
    super();
    this.allTodosCtl = new SubscriptionContorller<ITodo[]>(
      this,
      MESSAGES.ALL_TODOS,
      true
    );
    new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_ADDED,
      true,
      false,
      this.handleTodoAdded.bind(this)
    );
    new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_MODIFIED,
      true,
      false,
      this.handleTodoModified.bind(this)
    );
    new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_DELETED,
      true,
      false,
      this.handleTodoDeleted.bind(this)
    );

    this.completeSubCtl = new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.COMPLETE_TODO,
      true
    );

    this.deleteSubCtl = new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.DEL_TODO,
      true
    );

    // not broadcasted (limited to current context - Window)
    this.todoSelCtl = new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_SELECTED
    );

    this.getAlltodos = BMB.Subscribe(MESSAGES.GET_ALL_TODOS, undefined, true);

    const dsReady = BMB.Subscribe(MESSAGES.DATA_SOURCE_READY, () => {
      this.getAlltodos.publish(null);
      dsReady.dispose();
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
    return html`<ul>
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
    li[data-isDone] > .text {
      text-decoration: line-through;
    }
  `;
}
