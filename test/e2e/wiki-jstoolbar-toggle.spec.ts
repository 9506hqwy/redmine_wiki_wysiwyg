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
    /\[\[wiki-link\]\]/,
  );
});

test("Menu ext link", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_extlink",
    "ext-link",
    /\[ext-link\]\(http:\/\/localhost:3000\/.+\/ext-link\)/,
  );
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

  await editor.pressSequentially(data);
  await editor.press("Shift+Home");

  const menuButton = page.locator(`li.tab-wysiwyg-elements button.${menu}`);
  await menuButton.click();

  if (actions?.postAction) {
    await actions.postAction(page);
  }

  // sleep(100ms) until event handler completing.
  await sleep(100);

  await screenshot(page, `wiki_jstoolbar_toggle_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_jstoolbar_toggle_${data}_md_${browserName}`);
}
