import { test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

// https://www.redmine.org/issues/1575
test.skip(
  /^4\.(0|1)\./.test(process.env.REDMINE_VERSION || ""),
  "Not support 4.1 or earlier",
);

test("Table left align", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "leftalign",
    async (page) => {
      const headerCell = page.locator("div.ProseMirror th").first();
      await headerCell.click();

      const leftAlign = page.locator(
        "div.wysiwyg-table-menu.header span.button.left",
      );
      await leftAlign.click();
    },
    /\| :-------- \| :- \| :- \|/,
  );
});

test("Table center align", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "centeralign",
    async (page) => {
      const headerCell = page.locator("div.ProseMirror th").first();
      await headerCell.click();

      const centerAlign = page.locator(
        "div.wysiwyg-table-menu.header span.button.center",
      );
      await centerAlign.click();
    },
    /\| :---------: \| :- \| :- \|/,
  );
});

test("Table right align", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "rightalign",
    async (page) => {
      const headerCell = page.locator("div.ProseMirror th").first();
      await headerCell.click();

      const rightAlign = page.locator(
        "div.wysiwyg-table-menu.header span.button.right",
      );
      await rightAlign.click();
    },
    /\| ---------: \| :- \| :- \|/,
  );
});

test("Table add row before", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "addrowbefore",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const addRow = page.locator(
        "div.wysiwyg-table-menu.row span.button.add-row-before",
      );
      await addRow.click();
    },
    /(\| {14}\| {4}\| {4}\|\n){2}/,
  );
});

test("Table del row", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "delrow",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const delRow = page.locator(
        "div.wysiwyg-table-menu.row span.button.del-row",
      );
      await delRow.click();
    },
    /(\| {8}\| {4}\| {4}\|\n){1}/,
  );
});

test("Table add row after", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "addrowafter",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const addRow = page.locator(
        "div.wysiwyg-table-menu.row span.button.add-row-after",
      );
      await addRow.click();
    },
    /(\| {13}\| {4}\| {4}\|\n){2}/,
  );
});

test("Table add column before", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "addcolumnbefore",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const addColumn = page.locator(
        "div.wysiwyg-table-menu.row span.button.add-col-before",
      );
      await addColumn.click();
    },
    /\| :- \| :-------------- \| :- \| :- \|/,
  );
});

test("Table del column", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "delcolumn",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const delColumn = page.locator(
        "div.wysiwyg-table-menu.row span.button.del-col",
      );
      await delColumn.click();
    },
    /\| :- \| :- \|/,
  );
});

test("Table add column after", async ({ browser, browserName }) => {
  await table(
    browser,
    browserName,
    "addcolumnafter",
    async (page) => {
      const dataCell = page.locator("div.ProseMirror td").first();
      await dataCell.click();

      const addColumn = page.locator(
        "div.wysiwyg-table-menu.row span.button.add-col-after",
      );
      await addColumn.click();
    },
    /\| :------------- \| :- \| :- \| :- \|/,
  );
});

async function table(browser, browserName, data, action, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  const menuButton = page.locator("li.tab-wysiwyg-elements button.jstb_table");
  await menuButton.click();
  // sleep(100ms) until event handler completing.
  await sleep(100);

  await editor.pressSequentially(data);

  await action(page);

  await screenshot(page, `wiki_table_${data}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_table_${data}_md_${browserName}`);
}
