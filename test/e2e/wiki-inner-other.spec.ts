import { expect, test } from "@playwright/test";
import {
  editStart,
  newPage,
  screenshot,
  sleep,
  toHaveMarkdown,
  viewEditor,
} from "./utils";

test("Inner link document id", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "document_id",
    "document#1 ",
    /document#1/,
  );
});

test("Inner link document name", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "document_name",
    `document:"Test Document ${browserName}" `,
    /document:"Test Document .+"/,
  );
});

test("Inner link news id", async ({ browser, browserName }) => {
  await innerOther(browser, browserName, "news_id", "news#1 ", /news#1/);
});

test("Inner link news name", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "news_name",
    `news:"Test News ${browserName}" `,
    /news:"Test News .+"/,
  );
});

test("Inner link version id", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "version_id",
    "version#1 ",
    /version#1/,
  );
});

test("Inner link version name", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "version_name",
    "version:v1.0.0 ",
    /version:v1.0.0/,
  );
});

test("Inner link message id", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "message_id",
    "message#1 ",
    /message#1/,
  );
});

test("Inner link attachment name", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "attachment_name",
    "attachment:test.png ",
    /attachment:test.png/,
  );
});

test("Inner link source name", async ({ browser, browserName }) => {
  await innerOther(
    browser,
    browserName,
    "source_name",
    "source:README.md ",
    /source:README.md/,
  );
});

async function innerOther(browser, browserName, linkType, data, expected) {
  const page = await newPage(browser, browserName);
  await viewEditor(browserName, page);
  const editor = await editStart(page);

  await editor.pressSequentially(data);
  // sleep(1s) until event handler completing.
  await sleep(1000);

  await expect(
    page.locator(`a[data-innerlink_type="${linkType.split("_")[0]}"]`),
  ).toBeVisible();

  await screenshot(page, `wiki_inner_link_${linkType}_view_${browserName}`);

  await toHaveMarkdown(page, expected);

  await screenshot(page, `wiki_inner_link_${linkType}_md_${browserName}`);
}
