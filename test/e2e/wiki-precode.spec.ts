import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Precode update", async ({ browser, browserName }) => {
  await predode(browser, browserName, "precode", /```C\nprecode\n```/);
});

async function predode(browser, browserName, data, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.press("Control+Alt+c");

  await expect(page.locator("div.cm-content")).toBeVisible();

  // sleep(300ms) until event handler completing.
  await sleep(300);

  await editor.pressSequentially(data);

  const codeEditor = page.locator("div.cm-editor");
  await codeEditor.focus();

  await screenshot(page, `wiki_precode_update_view_text_${browserName}`);

  const langsButton = page.locator("button.language-button");
  langsButton.click();

  const lang = page.locator("ul.language-list li").first();
  lang.click();

  await expect(
    page.locator('div.cm-content[data-language="cpp"]'),
  ).toBeVisible();

  await screenshot(page, `wiki_precode_update_view_c_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_precode_update_md_${browserName}`);
}
