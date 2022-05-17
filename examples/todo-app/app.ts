import { BMB, Subscription } from "browser-message-broker";
import { html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { ITodo, ITodoErr, MESSAGES } from "./Messages";

(async () => {
  if ("SharedWorker" in window) {
    try {
      new SharedWorker("sharedWorker.js", {
        name: "todo-app-worker",
        credentials: "same-origin",
      });
    } catch (err) {
      console.log("sharedWorker registration failed: ", err);
    }
  }
})();

@customElement("todo-app")
export class TodoApp extends LitElement {
  addTodoSubs: Subscription<Partial<ITodo>>;
  constructor() {
    super();
    BMB.Subscribe<ITodoErr>(
      MESSAGES.TODO_ERR,
      (err) => {
        console.log(err);
      },
      true
    );
    this.addTodoSubs = BMB.Subscribe<Partial<ITodo>>(
      MESSAGES.ADD_TODO,
      undefined,
      true
    );
  }

  @query("#text")
  txtInput?: HTMLInputElement;

  override render() {
    return html`
      <div>Hello this is what you need to do:</div>
      <div>
        <input type="text" id="text" />
        <button @click=${this.addTodo}>Add</button>
      </div>
    `;
  }

  addTodo() {
    if (!this.txtInput) return;
    const text = this.txtInput?.value;
    if (!text || text === "") return;
    console.log("publish addTodo");
    this.addTodoSubs.publish({ text });
    this.txtInput.value = "";
    this.requestUpdate();
  }
}
