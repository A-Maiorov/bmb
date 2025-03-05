import { expect } from "@playwright/test";
import { initFixture, Scenario } from "../../suite/sutFixture";

Scenario.beforeEach(async ({ page }) => {
  await initFixture(page);
});

Scenario(
  "Worker and Second tab receive message from First tab",
  async ({ Given, When, Then }) => {
    await Given("Page with Pub/Sub broadcast channel", () =>
      SUT.setup.channel("test", { broadcast: true })
    );

    await Given(
      "Second page with Pub/Sub broadcast channel",
      () => {
        SUT.setup.channel("test", { broadcast: true });
        SUT.setup.nextMessagePromiseForChannel("test");
      },
      undefined,
      "B"
    );

    await Given(
      "Worker with subscription to the same Pub/Sub broadcast channel",
      async () => {
        await SUT.worker("W1").setup.channel("test", { broadcast: true });
        await SUT.worker("W1").setup.nextMessagePromiseForChannel("test");
      }
    );

    await When("First page sends message", async () => {
      await SUT.channel("test").sendMessage("hello");
    });

    const workerNextMsgVal = await When("Worker receives message", async () => {
      return SUT.worker("W1").channel("test").getNextMessagePromiseValue();
    });
    const secondPageNextMsgVal = await When(
      "Second page receives message",
      async () => {
        return SUT.channel("test").getNextMessagePromiseValue();
      },
      undefined,
      "B"
    );

    await Then("Worker and Second page have the same messages", () => {
      expect(workerNextMsgVal).toBe("hello");
      expect(secondPageNextMsgVal).toBe("hello");
    });
  }
);

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

// Scenario("TEST", async ({ Given, When, Then }) => {
//   await Given("Page 1", () =>
//     SUT.setup.channel("test", { broadcast: true, cache: true })
//   );
//   await Given(
//     "Page 2",
//     () => SUT.setup.channel("test", { broadcast: true, cache: true }),
//     undefined,
//     "p2"
//   );

//   await Given(
//     "Page 3",
//     () => SUT.setup.channel("test", { broadcast: true, cache: true }),
//     undefined,
//     "p3"
//   );

//   await Then("Channel state in Worker context contains correct value", () =>
//     expect("hello").toBe("hello")
//   );
// });

//});
