import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Ext link update", async ({ browser, browserName }) => {
  await extlink(
    browser,
    browserName,
    "aaa",
    "bbb",
    /\[aaa\]\(http:\/\/localhost:3000\/.+\/bbb\)/,
  );
});

async function extlink(browser, browserName, data, updated, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially(data);
  await editor.press("Shift+Home");

  const menuButton = page.locator(
    "li.tab-wysiwyg-elements button.jstb_extlink",
  );
  await menuButton.click();

  await expect(page.locator("div#wysiwyg_content_text a")).toBeVisible();

  page.on("dialog", async (dialog) => {
    await dialog.accept(updated);
  });
  const extLink = page.locator("#wysiwyg_content_text a.external");
  extLink.click();

  await screenshot(page, `wiki_external_link_update_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_external_link_update_md_${browserName}`);
}
