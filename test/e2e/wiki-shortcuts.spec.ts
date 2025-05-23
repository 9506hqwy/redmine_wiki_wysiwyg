import { test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Shortcut bold text decoration", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+b", "bold", /\*\*bold\*\*/);
});

test("Shortcut italic text decoration", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+i", "italic", /\*italic\*/);
});

test("Shortcut strike text decoration", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+x",
    "strike",
    /~~strike~~/,
  );
});

/* Browser Shortcut
test('Shortcut code text decoration', async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, 'Control+e', 'incline-code', /`incline-code`/);
});
*/

test("Shortcut text", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+0", "text", /text/);
});

test("Shortcut h1 heading", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+1", "h1", /# h1/);
});

test("Shortcut h2 heading", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+2", "h2", /## h2/);
});

test("Shortcut h3 heading", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+3", "h3", /### h3/);
});

test("Shortcut bullet list", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+8", "bullet", /\* bullet/);
});

test("Shortcut order list", async ({ browser, browserName }) => {
  await shortcuts(browser, browserName, "Control+Alt+7", "order", /1\. order/);
});

test("Shortcut back quote", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Shift+b",
    "backquote",
    /> backquote/,
  );
});

test("Shortcut code block", async ({ browser, browserName }) => {
  await shortcuts(
    browser,
    browserName,
    "Control+Alt+c",
    "code-block",
    /```\ncode-block\n```/,
  );
});

async function shortcuts(browser, browserName, shortcut, data, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("plain");
  await editor.press("Enter");
  await editor.press(shortcut);
  // sleep(100ms) until event handler completing.
  await sleep(100);
  await editor.pressSequentially(data);

  await screenshot(page, `wiki_shortcut_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_shortcut_${data}_md_${browserName}`);
}
