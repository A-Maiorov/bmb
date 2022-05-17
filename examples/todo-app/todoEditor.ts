import { html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { IModifyTodo, ITodo, MESSAGES } from "./Messages";
import { SubscriptionContorller } from "browser-message-broker/dist/LitSubscriptionContorller";

@customElement("todo-editor")
export class TodoEditor extends LitElement {
  todoSelectedCtl: SubscriptionContorller<ITodo>;
  modifyTodoCtl: SubscriptionContorller<IModifyTodo>;
  todoModifiedCtl: SubscriptionContorller<ITodo>;

  constructor() {
    super();
    this.todoSelectedCtl = new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_SELECTED,
      false,
      true
    );
    this.modifyTodoCtl = new SubscriptionContorller<IModifyTodo>(
      this,
      MESSAGES.MODIFY_TODO,
      true,
      false
    );
    this.todoModifiedCtl = new SubscriptionContorller<ITodo>(
      this,
      MESSAGES.TODO_MODIFIED,
      true,
      false,
      (todo) => {
        if (todo.id === this.todoSelectedCtl.state?.id)
          this.todoSelectedCtl.subscription?.publish(null as unknown as ITodo);
      }
    );
  }

  @query("#text")
  txtInput?: HTMLInputElement;

  override render() {
    if (this.todoSelectedCtl.state)
      return html`
        <div>Edit todo ${this.todoSelectedCtl.state.id}</div>
        <div>
          <input
            type="text"
            id="text"
            value=${this.todoSelectedCtl.state.text}
          />
          <button @click=${this.saveTodo}>save</button>
        </div>
      `;
    else return html``;
  }

  saveTodo() {
    if (!this.txtInput || !this.todoSelectedCtl.state) return;
    const newText = this.txtInput?.value;
    if (!newText || newText === "") return;
    console.log("publish saveTodo (in editor)");
    this.modifyTodoCtl.subscription?.publish({
      id: this.todoSelectedCtl.state.id,
      newText,
    });
  }
}
