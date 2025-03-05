import { test, type BrowserContext, type Page } from "@playwright/test";

export interface Fix {
  /**
   * Runs in browser
   */
  Given: <TArg, TRes>(
    name: string,
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg,
    page?: string
  ) => Promise<TRes>;
  /**
   * Runs in browser
   */
  When: <TArg, TRes>(
    name: string,
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg,
    page?: string
  ) => Promise<TRes>;
  /**
   * Runs in test runner
   */
  Then: <TRes>(name: string, fn: () => TRes) => Promise<TRes>;
}

async function getPage(context: BrowserContext, pageName: string = "Main") {
  let page = context.pages().find((x) => {
    const p = x as Page & { id?: string };
    return p.id === pageName;
  });

  if (page == undefined) {
    page = await context.newPage();
    await initFixture(page, pageName);
  }

  return page;
}

const _scenario = test.extend<Fix>({
  Given: async ({ context }, use) => {
    await use(
      async (name: string, fn: () => any, arg?: unknown, pageName?: string) => {
        return await test.step(
          "Given: " + name,
          async () => {
            const p = await getPage(context, pageName);
            const fix = getSutEvalFunc(p);

            return fix(fn, arg);
          },
          {
            box: true,
            timeout: 2000,
          }
        );
      }
    );
  },
  When: async ({ context }, use) => {
    await use(
      async (name: string, fn: () => any, arg?: unknown, pageName?: string) => {
        return await test.step(
          "When: " + name,
          async () => {
            const p = await getPage(context, pageName);
            const fix = getSutEvalFunc(p);

            return await fix(fn, arg);
          },
          {
            box: true,
            timeout: 2000,
          }
        );
      }
    );
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

export async function initFixture(
  page: Page & { id?: string },
  pageName: string = "Main"
) {
  await Scenario.step(
    "Init test page " + (pageName ?? ""),
    async () => {
      page.id = pageName;
      await page.goto("http://localhost:3000");
      console.log("nav");
      await page.evaluate((pn) => {
        BrowserMessageBroker.traceBroadcasts = true;
        BrowserMessageBroker.traceMessages = true;
        BrowserMessageBroker.senderId = pn;
      }, pageName);
      console.log("eval");
    },
    {
      box: true,
    }
  );
}

export function getSutEvalFunc(page: Page & { id?: string }) {
  return async <TArg, TRes>(
    fn: (arg?: TArg) => TRes | Promise<TRes>,
    arg?: TArg
  ) => {
    const fnStr = fn.toString();

    return Scenario.step(
      `Run on test page ${page.id}: ` + fnStr,
      async () => {
        return await page.evaluate<TRes, any>(fn, arg);
      },
      {
        box: true,
      }
    );
  };
}
