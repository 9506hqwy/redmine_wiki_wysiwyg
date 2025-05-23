import { expect, test } from "@playwright/test";
import { newPage, screenshot } from "./utils";

test.describe.configure({ mode: "serial" });

test("login test", async ({ page, browserName }) => {
  await page.goto("http://localhost:3000/");
  await expect(page.locator("a.login")).toBeVisible();

  await page.locator("a.login").click();
  await expect(page.locator("input#login-submit")).toBeVisible();

  await page.locator("input#username").fill("admin");
  await page.locator("input#password").fill("redmineadmin");
  await page.locator("input#login-submit").click();
  await expect(page.locator("a.logout")).toBeVisible();

  await screenshot(page, `login_${browserName}`);

  await page.context().storageState({ path: `/tmp/state_${browserName}.json` });
});

test("create new project", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto("http://localhost:3000/projects/new");

  const name = page.locator("input#project_name");
  await name.fill(`Test Project ${browserName}`);

  const identifier = page.locator("input#project_identifier");
  await identifier.fill(`test_project_${browserName}`);

  const module = page.locator(
    "input#project_enabled_module_names_wiki_wysiwyg",
  );
  await module.check();

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `create_project_${browserName}`);
});

test("create new issue", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto(
    `http://localhost:3000/projects/test_project_${browserName}/issues/new`,
  );

  const title = page.locator("input#issue_subject");
  await title.fill(`Test Issue ${browserName}`);

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `create_issue_${browserName}`);
});

test("create new news", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto(
    `http://localhost:3000/projects/test_project_${browserName}/news`,
  );

  const addNews = page.locator("div#content div.contextual a.icon-add");
  await addNews.click();

  const title = page.locator("input#news_title");
  await title.fill(`Test News ${browserName}`);

  const description = page.locator("textarea#news_description");
  await description.fill(`Test Description ${browserName}`);

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `create_news_${browserName}`);
});

test("create new document", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto(
    `http://localhost:3000/projects/test_project_${browserName}/documents`,
  );

  const addDoc = page.locator("div#content div.contextual a.icon-add");
  await addDoc.click();

  const title = page.locator("input#document_title");
  await title.fill(`Test Document ${browserName}`);

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `create_document_${browserName}`);
});

test("create new version", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto(
    `http://localhost:3000/projects/test_project_${browserName}/versions/new?back_url=`,
  );

  const title = page.locator("input#version_name");
  await title.fill("v1.0.0");

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `create_version_${browserName}`);
});
