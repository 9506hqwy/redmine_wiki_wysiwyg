import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Shortcut bold text decoration", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+b",
    "bold",
    null,
    /\*\*bold\*\*/,
  );
});

test("Shortcut italic text decoration", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+i",
    "italic",
    null,
    /\*italic\*/,
  );
});

test("Shortcut strike text decoration", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+x",
    "strike",
    null,
    /~~strike~~/,
  );
});

/* Browser Shortcut
test('Shortcut code text decoration', async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, 'Control+e', 'incline-code', null, /`incline-code`/);
});
*/

test("Shortcut text", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+0", "text", null, /text/);
});

test("Shortcut h1 heading", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+1", "h1", null, /# h1/);
});

test("Shortcut h2 heading", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+2",
    "h2",
    "div#wysiwyg_content_text h2",
    /## h2/,
  );
});

test("Shortcut h3 heading", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+3",
    "h3",
    "div#wysiwyg_content_text h3",
    /### h3/,
  );
});

test("Shortcut bullet list", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+8",
    "bullet",
    "div#wysiwyg_content_text ul",
    /\* bullet/,
  );
});

test("Shortcut order list", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+7",
    "order",
    "div#wysiwyg_content_text ol",
    /1\. order/,
  );
});

test("Shortcut back quote", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Shift+b",
    "backquote",
    "div#wysiwyg_content_text blockquote",
    /> backquote/,
  );
});

test("Shortcut code block", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+c",
    "code-block",
    "div#wysiwyg_content_text div.milkdown-code-block",
    // FIXME: invalid character order using firefox in test only.
    /```\n[-a-z]{10}\n```/,
  );
});

async function shortcuts(
  browser,
  browserName,
  shortcut,
  data,
  selector,
  expected,
) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("plain");
  await editor.press("Enter");
  await editor.press(shortcut);

  if (selector) {
    await expect(page.locator(selector)).toBeVisible();
  }

  await editor.press("Control+End");
  await editor.pressSequentially(data);

  await screenshot(page, `wiki_shortcut_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_shortcut_${data}_md_${browserName}`);
}
