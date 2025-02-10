import { expect } from "@playwright/test";
import { initFixture, Scenario } from "../../suite/sutFixture";

Scenario.beforeEach(async ({ page }) => {
  await initFixture(page);
});

//Scenario.describe("Same scripting context", () => {
Scenario(
  "One-time subscriber receives next message",
  async ({ Given, When, Then }) => {
    await Given("Pub/Sub channel", () =>
      SUT.setup.channel("test", { broadcast: false })
    );

    await Given("One-time subscription", () =>
      SUT.setup.nextMessagePromiseForChannel("test")
    );

    const nextMsg = await When("Message is sent", () => {
      SUT.channel("test").sendMessage("hello");
      return SUT.channel("test").getNextMessagePromiseValue();
    });

    await Then("Subscriber received correct message", () =>
      expect(nextMsg).toBe("hello")
    );
  }
);

Scenario(
  "One-time subscriber does not receive subsequent message",
  async ({ Given, When, Then }) => {
    await Given("Pub/Sub channel", () =>
      SUT.setup.channel("test", { broadcast: false })
    );

    await Given("One-time subscription", () =>
      SUT.setup.nextMessagePromiseForChannel("test")
    );

    await When("First message is sent", () => {
      SUT.channel("test").sendMessage("hello");
    });

    const expectedMsg = await When("Second message is sent", () => {
      SUT.channel("test").sendMessage("hello1");
      return SUT.channel("test").getNextMessagePromiseValue();
    });

    await Then("Subscriber received first message", () =>
      expect(expectedMsg).toBe("hello")
    );
  }
);

Scenario("Subscribers receive message", async ({ Given, When, Then }) => {
  await Given("Pub/Sub channel", () =>
    SUT.setup.channel("test", { broadcast: false })
  );

  await Given("Pub/Sub subscription A", () =>
    SUT.setup.channelSubscription("test", "A")
  );

  await Given("Pub/Sub subscription B", () =>
    SUT.setup.channelSubscription("test", "B")
  );

  const [subscriberStateA, subscriberStateB] = await When(
    "Message is sent",
    async () => {
      await SUT.channel("test").sendMessage("hello");
      return [
        await SUT.channel("test").getLatestSubscriberState("A"),
        await SUT.channel("test").getLatestSubscriberState("B"),
      ];
    }
  );

  await Then("Subscribers received correct value", () => {
    expect(subscriberStateA).toBe("hello");
    expect(subscriberStateB).toBe("hello");
  });
});

Scenario(
  "Channel state contains latest message",
  async ({ Given, When, Then }) => {
    await Given("Pub/Sub channel", () =>
      SUT.setup.channel("test", { broadcast: false, cache: true })
    );

    await When("First message is sent", async () => {
      await SUT.channel("test").sendMessage("hello1");
    });

    const currState = await When("Second message is sent", async () => {
      await SUT.channel("test").sendMessage("hello2");
      return await SUT.channel("test").getCurrentState();
    });

    await Then("Channel state contains second message", () => {
      expect(currState).toBe("hello2");
    });
  }
);
//});
