import { expect } from "@playwright/test";
import { initFixture, Scenario } from "../../suite/sutFixture";

Scenario.beforeEach(async ({ page }) => {
  await initFixture(page);
});

Scenario(
  "Main tab sends Request to Second tab receive message from First tab",
  async ({ Given, When, Then }) => {
    await Given("Page with Req/Rep broadcast channel", () =>
      SUT.setup.request("test", { broadcast: true })
    );

    await Given("Worker configured to reply to requests", async () => {
      await SUT.worker("W1").setup.reply(
        "test",
        { broadcast: true },
        "hi from worker"
      );
    });

    const response = await When("Page sends request", async () => {
      return await SUT.channel("test").sendRequest("hello");
    });

    await Then("Page receives a response from the Worker", () => {
      expect(response).toBe("hi from worker");
    });
  }
);

Scenario(
  "Worker and Second tab reply to the request from First tab (first response wins)",
  async ({ Given, When, Then }) => {
    await Given("Page with Req/Rep channel", () =>
      SUT.setup.request("test", { broadcast: true })
    );

    await Given(
      "Second page configured to reply",
      () =>
        SUT.setup.reply("test", { broadcast: true }, "Reply from Second page"),
      undefined,
      "B"
    );

    await Given("Worker configured to reply with delay", async () => {
      await SUT.worker("W1").setup.reply(
        "test",
        { broadcast: true },
        "Reply from Worker",
        200
      );
    });

    const response = await When("First page sends request", async () => {
      return await SUT.channel("test").sendRequest("hello");
    });

    await Then("First page receives response from Second page", () => {
      expect(response).toBe("Reply from Second page");
    });
  }
);
