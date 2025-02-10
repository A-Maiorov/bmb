import { expect } from "@playwright/test";
import { initFixture, Scenario } from "../../suite/sutFixture";

Scenario.beforeEach(async ({ page }) => {
  await initFixture(page);
});

Scenario("Worker receives message from UI", async ({ Given, When, Then }) => {
  await Given("Pub/Sub broadcast channel in UI context", () =>
    SUT.setup.channel("test", { broadcast: true })
  );

  await Given(
    "Worker with subscription to the same Pub/Sub broadcast channel",
    async () => {
      await SUT.worker("W1").setup.channel("test", { broadcast: true });
      await SUT.worker("W1").setup.nextMessagePromiseForChannel("test");
    }
  );

  const workerNextMsgVal = await When("UI sends message", async () => {
    await SUT.channel("test").sendMessage("hello");
    return SUT.worker("W1").channel("test").getNextMessagePromiseValue();
  });

  await Then("Worker receives message", () =>
    expect(workerNextMsgVal).toBe("hello")
  );
});

Scenario(
  "Channel state contains latest broadcasted message",
  async ({ Given, When, Then }) => {
    await Given("Pub/Sub broadcast channel in UI context", () =>
      SUT.setup.channel("test", { broadcast: true, cache: true })
    );

    await Given(
      "Worker with subscription to the same Pub/Sub broadcast channel",
      async () => {
        return await SUT.worker("W1").setup.channel("test", {
          broadcast: true,
          cache: true,
        });
      }
    );

    const currWorkerChannelState = await When("UI sends message", async () => {
      await SUT.channel("test").sendMessage("not-hello");
      await SUT.channel("test").sendMessage("hello");

      await new Promise<void>((res) => {
        setTimeout(() => {
          res();
        }, 10);
      });

      return await SUT.worker("W1").channel("test").getCurrentState();
    });

    await Then("Channel state in Worker context contains correct value", () =>
      expect(currWorkerChannelState).toBe("hello")
    );
  }
);
//});
