import { css, html, LitElement } from "lit";
import {
  customElement,
  query,
  state,
} from "lit/decorators.js";
import {
  ITodo,
  modifyTodoChannel,
  todoDeletedChannel,
  todoModifiedChannel,
  todoSelectedChannel,
} from "./Channels";
import { subscribe } from "./subscribeDecorator";

@customElement("todo-editor")
export class TodoEditor extends LitElement {
  @state()
  selectedTodo: ITodo | undefined = undefined;

  @subscribe(todoModifiedChannel)
  @subscribe(todoDeletedChannel)
  onTodoModified(msg: ITodo) {
    if (
      this.selectedTodo &&
      msg.id === this.selectedTodo.id
    )
      this.selectedTodo = undefined;
  }

  @subscribe(todoSelectedChannel)
  onTodoSelected(msg: ITodo) {
    this.selectedTodo = msg;
  }

  @query("#text")
  txtInput?: HTMLInputElement;

  override render() {
    if (this.selectedTodo)
      return html`
        <div>Edit todo ${this.selectedTodo.id}</div>
        <div>
          <input
            type="text"
            id="text"
            value=${this.selectedTodo.text}
          />
          <button @click=${this.saveTodo}>save</button>
        </div>
      `;
    else return html``;
  }

  saveTodo() {
    if (!this.txtInput || !this.selectedTodo) return;

    const newText = this.txtInput?.value;
    if (!newText || newText === "") return;

    modifyTodoChannel.send({
      id: this.selectedTodo.id,
      newText,
    });
  }

  static override styles = css`
    :host {
      display: block;
      margin: 10px 0px;
    }
  `;
}
