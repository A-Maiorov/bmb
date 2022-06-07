import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { IModifyTodo, ITodo, MESSAGES } from "./Messages";
import { BMB, Subscription } from "browser-message-broker";

@customElement("todo-editor")
export class TodoEditor extends LitElement {
  todoSelectedSubs: Subscription<ITodo>;
  todoModifiedSubs: Subscription<ITodo>;
  todoDeletedSubs: Subscription<ITodo>;
  @state()
  selectedTodo: ITodo | undefined = undefined;

  override disconnectedCallback(): void {
    this.todoSelectedSubs.dispose();
    this.todoModifiedSubs.dispose();
    this.todoDeletedSubs.dispose();
    super.disconnectedCallback();
  }

  constructor() {
    super();

    this.todoSelectedSubs = BMB.Subscribe<ITodo>(
      MESSAGES.TODO_SELECTED,
      this.onTodoSelected.bind(this),
      true,
      true
    );

    this.todoModifiedSubs = BMB.Subscribe<ITodo>(
      MESSAGES.TODO_MODIFIED,
      this.onTodoModified.bind(this),
      true,
      false
    );

    this.todoDeletedSubs = BMB.Subscribe<ITodo>(
      MESSAGES.TODO_DELETED,
      this.onTodoModified.bind(this),
      true,
      false
    );
  }

  onTodoModified(msg: ITodo) {
    if (this.selectedTodo && msg.id === this.selectedTodo.id)
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
          <input type="text" id="text" value=${this.selectedTodo.text} />
          <button @click=${this.saveTodo}>save</button>
        </div>
      `;
    else return html``;
  }

  saveTodo() {
    if (!this.txtInput || !this.selectedTodo) return;

    const newText = this.txtInput?.value;
    if (!newText || newText === "") return;

    BMB.Broadcast<IModifyTodo>(MESSAGES.MODIFY_TODO, {
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
