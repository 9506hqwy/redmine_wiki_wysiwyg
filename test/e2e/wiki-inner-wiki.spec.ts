import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Inner wiki project, wiki, title", async ({ browser, browserName }) => {
  await innerWiki(
    browser,
    browserName,
    "proj_wiki_title",
    async (page) => {
      const project = page.locator("input#wysisyg-inner-link-project");
      await project.fill("a");

      const wiki = page.locator("input#wysisyg-inner-link-wiki");
      await wiki.fill("b");

      const title = page.locator("input#wysisyg-inner-link-title");
      await title.fill("c");

      const ok = page.locator(
        'dialog.wysisyg-inner-link-dialog button[value="submit"]',
      );
      await ok.click();
    },
    /\[\[a:b\|c\]\]/,
  );
});

test("Inner wiki wiki, title", async ({ browser, browserName }) => {
  await innerWiki(
    browser,
    browserName,
    "wiki_title",
    async (page) => {
      const wiki = page.locator("input#wysisyg-inner-link-wiki");
      await wiki.fill("b");

      const title = page.locator("input#wysisyg-inner-link-title");
      await title.fill("c");

      const ok = page.locator(
        'dialog.wysisyg-inner-link-dialog button[value="submit"]',
      );
      await ok.click();
    },
    /\[\[b\|c\]\]/,
  );
});

test("Inner wiki wiki", async ({ browser, browserName }) => {
  await innerWiki(
    browser,
    browserName,
    "wiki",
    async (page) => {
      const wiki = page.locator("input#wysisyg-inner-link-wiki");
      await wiki.fill("b");

      const ok = page.locator(
        'dialog.wysisyg-inner-link-dialog button[value="submit"]',
      );
      await ok.click();
    },
    /\[\[b\]\]/,
  );
});

async function innerWiki(browser, browserName, testCaseName, action, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  const menuButton = page.locator("li.tab-wysiwyg-elements button.jstb_link");
  await menuButton.click();

  await action(page);

  await screenshot(
    page,
    `wiki_inner_link_wiki_${testCaseName}_view_${browserName}`,
  );

  await toHaveMarkdown(page, expected);

  await screenshot(
    page,
    `wiki_inner_link_wiki_${testCaseName}_md_${browserName}`,
  );
}
