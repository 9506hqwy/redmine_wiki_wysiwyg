import { expect, test } from "@playwright/test";
import { newPage, screenshot } from "./utils";

test.describe.configure({ mode: "serial" });

test("delete project", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  await page.goto(`http://localhost:3000/projects/test_project_${browserName}`);

  const actionsButton = page.locator("div.contextual span.drdn-trigger");
  await actionsButton.click();

  const delButton = page.locator("div.drdn-content a.icon-del");
  await delButton.click();

  const confirm = page.locator("input#confirm");
  await confirm.waitFor();
  await confirm.fill(`test_project_${browserName}`);

  const submit = page.locator('input[name="commit"]');
  await submit.click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `delete_project_${browserName}`);
});
