import { test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Menu bold text decoration", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_strong", "bold", /\*\*bold\*\*/);
});

test("Menu italic text decoration", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_em", "italic", /\*italic\*/);
});

test("Menu strike text decoration", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_del", "strike", /~~strike~~/);
});

test("Menu code text decoration", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_code", "code", /`code`/);
});

test("Menu h1 heading", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_h1", "h1", /# h1/);
});

test("Menu h2 heading", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_h2", "h2", /## h2/);
});

test("Menu h3 heading", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_h3", "h3", /### h3/);
});

test("Menu bullet list", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_ul", "bullet", /\* bullet/);
});

test("Menu order list", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_ol", "order", /1\. order/);
});

test("Menu task list", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_tl", "task", /\* \[ \] task/);
});

test("Menu back quote", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_bq", "backquote", /> backquote/);
});

// TODO: jstb_unbq

test("Menu table block", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_table",
    "table",
    /\| table \| {4}\| {4}\|\n\| :---- \| :- \| :- \|\n\| {7}\| {4}\| {4}\|\n\| {7}\| {4}\| {4}\|/,
  );
});

test("Menu code block", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_pre",
    "code-block",
    /```\ncode-block\n```/,
  );
});

test("Menu precode block", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_precode",
    "precode-block",
    /```c\nprecode-block\n```/,
    {
      postAction: async (page) => {
        const lang = page.locator("div.wysiwyg-precode-menu li").first();
        await lang.click();
      },
    },
  );
});

test("Menu wiki link", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_link",
    "wiki-link",
    /\[\[a:b\|c\]\]/,
    {
      postAction: async (page) => {
        await page.locator("input#wysisyg-inner-link-project").fill("a");
        await page.locator("input#wysisyg-inner-link-wiki").fill("b");
        await page.locator("input#wysisyg-inner-link-title").fill("c");
        await page
          .locator('dialog.wysisyg-inner-link-dialog button[value="submit"]')
          .click();
      },
    },
  );
});

test("Menu ext link", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_extlink",
    "ext-link",
    /\[a\]\(http:\/\/localhost:3000\/.+\/a\)/,
    {
      setup: async (page) => {
        page.on("dialog", async (dialog) => {
          await dialog.accept("a");
        });
      },
    },
  );
});

test("Menu image block", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_img", "img", /!\[a\]\(a\)/, {
    setup: async (page) => {
      page.on("dialog", async (dialog) => {
        await dialog.accept("a");
      });
    },
  });
});

type Actions = {
  setup?: (Page) => void;
  postAction?: (Page) => void;
};

async function jstoolbar(
  browser,
  browserName,
  menu,
  data,
  expected,
  actions?: Actions,
) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("plain");
  await editor.press("Enter");

  if (actions?.setup) {
    await actions.setup(page);
  }

  const menuButton = page.locator(`li.tab-wysiwyg-elements button.${menu}`);
  await menuButton.click();

  if (actions?.postAction) {
    await actions.postAction(page);
  }

  // sleep(100ms) until event handler completing.
  await sleep(100);
  await editor.pressSequentially(data);

  await screenshot(page, `wiki_jstoolbar_insert_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_jstoolbar_insert_${data}_md_${browserName}`);
}
