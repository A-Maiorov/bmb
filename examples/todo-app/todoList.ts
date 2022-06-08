import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ITodo, MESSAGES } from "./Messages";
import { BMB } from "browser-message-broker";
import { TodoListController } from "./todoList.controller";

BMB.ConfigureChannel(
  MESSAGES.DATA_SOURCE_READY,
  true,
  true,
  false
);

@customElement("todo-list")
export class TodoList extends LitElement {
  @state()
  allTodos: ITodo[] = [];

  controller = new TodoListController(this);

  override render() {
    return html`<div>TO DO:</div>
      <ul>
        ${this.allTodos.map(
          (todo) => html`
            <li ?data-isDone=${todo.isDone}>
              <button
                @click=${() =>
                  this.controller.completeTodo(todo)}
                class="check"
              >
                ✔
              </button>
              <span
                @click=${() =>
                  this.controller.selectTodo(todo)}
                class="text"
                >${todo.text}</span
              >
              <button
                @click=${() =>
                  this.controller.deleteTodo(todo)}
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
