import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Inner link issue enter", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("#");
  // sleep(1s) until event handler completing.
  await sleep(1000);

  await expect(page.locator("li[data-issue_id]")).toBeVisible();

  await screenshot(
    page,
    `wiki_inner_link_issue_autocomplete_view_${browserName}`,
  );

  await editor.press("Enter");
  await editor.pressSequentially("a");

  await screenshot(page, `wiki_inner_link_issue_enter_view_${browserName}`);

  await toHaveMarkdown(page, /#\d+ a/);

  await screenshot(page, `wiki_inner_link_issue_enter_md_${browserName}`);
});

test("Inner link issue click", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially("#");
  // sleep(1s) until event handler completing.
  await sleep(1000);

  const issue = page.locator("li[data-issue_id]");
  await expect(issue).toBeVisible();

  await issue.click();
  await editor.pressSequentially("a");

  await screenshot(page, `wiki_inner_link_issue_click_view_${browserName}`);

  await toHaveMarkdown(page, /#\d+ a/);

  await screenshot(page, `wiki_inner_link_issue_click_md_${browserName}`);
});
