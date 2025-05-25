import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Menu bold text decoration", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_strong",
    "bold",
    "div#wysiwyg_content_text strong",
    /\*\*bold\*\*/,
  );
});

test("Menu italic text decoration", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_em",
    "italic",
    "div#wysiwyg_content_text em",
    /\*italic\*/,
  );
});

test("Menu strike text decoration", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_del",
    "strike",
    "div#wysiwyg_content_text del",
    /~~strike~~/,
  );
});

test("Menu code text decoration", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_code",
    "code",
    "div#wysiwyg_content_text code",
    /`code`/,
  );
});

test("Menu h1 heading", async ({ browser, browserName }) => {
  await jstoolbar(browser, browserName, "jstb_h1", "h1", null, /# h1/);
});

test("Menu h2 heading", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_h2",
    "h2",
    "div#wysiwyg_content_text h2",
    /## h2/,
  );
});

test("Menu h3 heading", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_h3",
    "h3",
    "div#wysiwyg_content_text h3",
    /### h3/,
  );
});

test("Menu bullet list", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_ul",
    "bullet",
    "div#wysiwyg_content_text ul",
    /\* bullet/,
  );
});

test("Menu order list", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_ol",
    "order",
    "div#wysiwyg_content_text ol",
    /1\. order/,
  );
});

test("Menu task list", async ({ browser, browserName }) => {
  // https://www.redmine.org/issues/35742
  test.skip(
    /^4\./.test(process.env.REDMINE_VERSION || ""),
    "Not support 4.2 or earlier",
  );

  await jstoolbar(
    browser,
    browserName,
    "jstb_tl",
    "task",
    "div#wysiwyg_content_text ul",
    /\* \[ \] task/,
  );
});

test("Menu back quote", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_bq",
    "backquote",
    "div#wysiwyg_content_text blockquote",
    /> backquote/,
  );
});

// TODO: jstb_unbq

test("Menu code block", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_pre",
    "code-block",
    "div#wysiwyg_content_text div.milkdown-code-block",
    /```\ncode-block\n```/,
  );
});

test("Menu precode block", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_precode",
    "precode-block",
    "div#wysiwyg_content_text div.milkdown-code-block",
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
    "div#wysiwyg_content_text a",
    /\[\[wiki-link\]\]/,
  );
});

test("Menu ext link", async ({ browser, browserName }) => {
  await jstoolbar(
    browser,
    browserName,
    "jstb_extlink",
    "ext-link",
    "div#wysiwyg_content_text a",
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
  selector,
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

  if (selector) {
    await expect(page.locator(selector)).toBeVisible();
  }

  await screenshot(page, `wiki_jstoolbar_toggle_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_jstoolbar_toggle_${data}_md_${browserName}`);
}
