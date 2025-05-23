import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Inner link user enter", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("@a");
  // sleep(1s) until event handler completing.
  await sleep(1000);

  await expect(page.locator("li[data-login]")).toBeVisible();

  await screenshot(
    page,
    `wiki_inner_link_user_autocomplete_view_${browserName}`,
  );

  await editor.press("Enter");
  await editor.pressSequentially("a");

  await screenshot(page, `wiki_inner_link_user_enter_view_${browserName}`);

  await toHaveMarkdown(page, /@admin a/);

  await screenshot(page, `wiki_inner_link_user_enter_md_${browserName}`);
});

test("Inner link user click", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("@a");
  // sleep(1s) until event handler completing.
  await sleep(1000);

  const user = page.locator("li[data-login]");
  await expect(user).toBeVisible();

  await user.click();
  await editor.pressSequentially("a");

  await screenshot(page, `wiki_inner_link_user_click_view_${browserName}`);

  await toHaveMarkdown(page, /@admin a/);

  await screenshot(page, `wiki_inner_link_usesr_click_md_${browserName}`);
});
