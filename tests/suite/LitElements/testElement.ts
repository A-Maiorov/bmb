import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SubscriptionContorller } from "browser-message-broker/dist/LitSubscriptionContorller";

export const initialPayloadValue = "initial state";

class TestMsg {
  public payload = "testmsg";
}

@customElement("test-element")
export class TestElement extends LitElement {
  ctl = new SubscriptionContorller<TestMsg>(this, TestMsg.name);

  @property({ type: String })
  payload: string = initialPayloadValue;
  override render() {
    return html`${this.payload}${this.ctl.state?.payload}`;
  }
}
