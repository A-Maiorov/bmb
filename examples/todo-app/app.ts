import { PubSubChannel } from "browser-message-broker";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { ITodo, ITodoErr, MESSAGES } from "./Messages";

const errorChannel = PubSubChannel.getOrCreate<ITodoErr>(
  MESSAGES.TODO_ERR,
  { enableBroadcast: true, enableCaching: false }
);
errorChannel.subscribe((err) => {
  console.log(err);
});

@customElement("todo-app")
export class TodoApp extends LitElement {
  @query("#text")
  txtInput?: HTMLInputElement;

  override render() {
    return html`
      <div>
        <input
          type="text"
          id="text"
          placeholder="Type here what to do"
        />

        <button @click=${this.addTodo}>Add</button>
      </div>
      <i>Click existing todo text in order to change it</i>
    `;
  }

  addTodo() {
    if (!this.txtInput) return;
    const text = this.txtInput?.value;
    if (!text || text === "") return;

    PubSubChannel.broadcast<Partial<ITodo>>(
      MESSAGES.ADD_TODO,
      { text }
    );

    this.txtInput.value = "";
    this.requestUpdate();
  }

  static override styles?: CSSResultGroup | undefined = css`
    :host {
      display: block;
      margin: 10px 0px;
    }

    i {
      font-size: small;
      color: gray;
    }
  `;
}
