import { BMB } from "browser-message-broker";
import { expect } from "@open-wc/testing";

class TestMsg {
  public payload = "testmsg";
}

describe("Browser Message Broker subscriber", () => {
  let received = false;
  let receivedPayload = "";

  BMB.Subscribe<TestMsg>(TestMsg.name, (x) => {
    received = true;
    receivedPayload = x.payload;
  });
  before(async () => {
    await BMB.Publish(TestMsg.name, new TestMsg());
  });

  it("sould receive published message", async () => {
    expect(received).to.be.true;
  });

  it("sould receive correct payolad", async () => {
    expect(receivedPayload).to.equal("testmsg");
  });

  it("sould be possible to retrieve state of the message", async () => {
    const state = BMB.GetState<TestMsg>(TestMsg.name);
    expect(state?.payload).to.equal("testmsg");
  });
});
