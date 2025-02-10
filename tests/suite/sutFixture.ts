import { test, type BrowserContext, type Page } from "@playwright/test";

export interface Fix {
  /**
   * Runs in browser
   */
  Given: <TArg, TRes>(
    name: string,
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg
  ) => Promise<TRes>;
  /**
   * Runs in browser
   */
  When: <TArg, TRes>(
    name: string,
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg
  ) => Promise<TRes>;
  /**
   * Runs in test runner
   */
  Then: <TRes>(name: string, fn: () => TRes) => Promise<TRes>;
}

const _scenario = test.extend<Fix>({
  Given: async ({ page }, use) => {
    const fix = getSutEvalFunc(page);
    await use(async (name: string, fn: () => any, arg: unknown) => {
      return await test.step("Given: " + name, () => fix(fn, arg), {
        box: true,
        timeout: 2000,
      });
    });
  },
  When: async ({ page }, use) => {
    const fix = getSutEvalFunc(page);
    await use(async (name: string, fn: () => any, arg: unknown) => {
      return await test.step("When: " + name, () => fix(fn, arg), {
        box: true,
        timeout: 2000,
      });
    });
  },
  Then: async ({}, use) => {
    await use(async <T>(name: string, fn: () => T) => {
      return await test.step("Then: " + name, fn, {
        box: true,
        timeout: 2000,
      });
    });
  },
});

export const Scenario = _scenario;

export async function initFixture(page: Page) {
  return await test.step("Init SUT fixture", async () => {
    await page.goto("http://localhost:3000");
    await page.evaluate(() => {
      BrowserMessageBroker.traceBroadcasts = true;
      BrowserMessageBroker.traceMessages = true;
      BrowserMessageBroker.senderId = "UI";
    });
  });
}

export function getSutEvalFunc(page: Page) {
  return async <TArg, TRes>(
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg
  ) => {
    return await page.evaluate<TRes, any>(fn, arg);
  };
}
