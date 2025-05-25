import { expect } from "@playwright/test";

export const editStart = async (page) => {
  const editor = page.locator("#wysiwyg_content_text div.ProseMirror");
  await editor.focus();
  await editor.press("End");
  await editor.press("Enter");
  return editor;
};

export const newPage = async (browser, browserName) => {
  const context = await browser.newContext({
    storageState: `/tmp/state_${browserName}.json`,
  });
  return await context.newPage();
};

export const screenshot = async (page, filename) => {
  await page.screenshot({
    path: `artifacts/e2e/${filename}.png`,
    fullPage: true,
  });
};

export const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const toHaveMarkdown = async (page, expected) => {
  const mdTab = page.locator("a.tab-edit");
  await mdTab.click();

  const md = page.locator("#content_text");
  await expect(md).toBeVisible();
  await expect(md).toHaveValue(expected);
};

export const viewEditor = async (browserName, page) => {
  await page.goto(
    `http://localhost:3000/projects/test_project_${browserName}/wiki`,
  );

  const wysiwygTab = page.locator("a.tab-wysiwyg");
  await wysiwygTab.waitFor();
  await wysiwygTab.click();
};
