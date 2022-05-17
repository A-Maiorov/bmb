import { BMB } from "browser-message-broker";
import {
  initialPayloadValue,
  TestElement,
} from "./suite/LitElements/testElement";
import { expect, fixture, html } from "@open-wc/testing";
import { LitElement } from "lit";

class TestMsg {
  public payload = "testmsg";
  constructor(m?: string) {
    this.payload = m || this.payload;
  }
}

describe("Lit TestElement", () => {
  it("Should be registered as Custom Element", () => {
    const el = document.createElement("test-element");
    expect(el).to.be.instanceOf(TestElement);
  });

  it("Should render default value", async () => {
    const el = await fixture(html`<test-element></test-element>`);
    expect(el).shadowDom.to.equal(`${initialPayloadValue}`);
  });

  describe("LitSubscriber", () => {
    it("Should receive message and trigger test-element to render it's payload", async () => {
      const el = await fixture(html`<test-element></test-element>`);
      const msg = new TestMsg();
      await BMB.Publish(TestMsg.name, msg);

      expect(el).shadowDom.to.equal(`${initialPayloadValue}${msg.payload}`);
    });

    it("Should render persisted message state", async () => {
      const msg = new TestMsg("[persisted_test]");
      await BMB.Publish(TestMsg.name, msg);

      const el = await fixture(html`<test-element></test-element>`);

      expect(el).shadowDom.to.equal(`${initialPayloadValue}${msg.payload}`);
    });
  });
});
