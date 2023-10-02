import { PubSubChannel } from "browser-message-broker";
import { expect } from "@open-wc/testing";

class TestMsg {
  public payload = "testmsg";
}

describe("Browser Message Broker subscriber", () => {
  let received = false;
  let receivedPayload = "";

  const channel = PubSubChannel.for<TestMsg>(TestMsg.name, {
    broadcast: false,
    cache: true,
  });

  channel.subscribe((x) => {
    received = true;
    receivedPayload = x.payload;
  });

  before(async () => {
    await channel.send(new TestMsg());
  });

  it("should receive published message", async () => {
    expect(received).to.be.true;
  });

  it("should receive correct payload", async () => {
    expect(receivedPayload).to.equal("testmsg");
  });

  it("should be possible to retrieve state of the message", async () => {
    const state = channel.getState();
    expect(state?.payload).to.equal("testmsg");
  });

  it("should be possible to await next message without configuring subscription", async () => {
    setTimeout(() => {
      PubSubChannel.publish("testmsg", new TestMsg());
    }, 100);

    const msg = await PubSubChannel.nextMessage<TestMsg>("testmsg");

    expect(msg).to.be.not.null;
    expect(msg.payload).to.equal("testmsg");
  });
});
