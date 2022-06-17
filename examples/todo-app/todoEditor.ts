import { css, html, LitElement } from "lit";
import {
  customElement,
  query,
  state,
} from "lit/decorators.js";
import { IModifyTodo, ITodo, MESSAGES } from "./Messages";
import { PubSubChannel } from "browser-message-broker";
import { Disposer } from "browser-message-broker/dist/Types";

@customElement("todo-editor")
export class TodoEditor extends LitElement {
  disposeTodoSelected: Disposer;
  disposeTodoModified: Disposer;
  disposeTodoDeleted: Disposer;
  @state()
  selectedTodo: ITodo | undefined = undefined;

  override disconnectedCallback(): void {
    this.disposeTodoSelected();
    this.disposeTodoModified();
    this.disposeTodoDeleted();
    super.disconnectedCallback();
  }

  constructor() {
    super();

    this.disposeTodoSelected =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_SELECTED,
        {
          enableBroadcast: true,
          enableCaching: true,
        }
      ).subscribe(this.onTodoSelected.bind(this));

    this.disposeTodoModified =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_MODIFIED,
        {
          enableBroadcast: true,
          enableCaching: true,
        }
      ).subscribe(this.onTodoModified.bind(this));

    this.disposeTodoDeleted =
      PubSubChannel.getOrCreate<ITodo>(
        MESSAGES.TODO_DELETED,
        {
          enableBroadcast: true,
          enableCaching: false,
        }
      ).subscribe(this.onTodoModified.bind(this));
  }

  onTodoModified(msg: ITodo) {
    if (
      this.selectedTodo &&
      msg.id === this.selectedTodo.id
    )
      this.selectedTodo = undefined;
  }

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

    PubSubChannel.broadcast<IModifyTodo>(
      MESSAGES.MODIFY_TODO,
      {
        id: this.selectedTodo.id,
        newText,
      }
    );
  }

  static override styles = css`
    :host {
      display: block;
      margin: 10px 0px;
    }
  `;
}
