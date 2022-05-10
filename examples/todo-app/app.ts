import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { BMB } from "browser-message-broker";
import { LitSubscriber } from "browser-message-broker/dist/LitSubscriber";

@customElement("todo-app")
export class TodoApp extends LitElement {
  subs: LitSubscriber<MsgAddTodo>;

  constructor() {
    super();
    this.subs = new LitSubscriber<MsgAddTodo>(this, MsgAddTodo.name);
  }

  override render() {
    return html`
      <div>Hello world! ${this.subs.state?.text}</div>
      <todo-btn-add> </todo-btn-add>
    `;
  }
}

@customElement("todo-btn-add")
export class AddTodoButton extends LitElement {
  constructor() {
    super();
  }

  override render() {
    return html`
      <button
        @click=${() =>
          BMB.Publish(MsgAddTodo.name, new MsgAddTodo("Go drink beer"))}
      >
        ADD TODO
      </button>
    `;
  }
}

class MsgAddTodo {
  text: string = "";
  constructor(t: string) {
    this.text = t;
  }
}
