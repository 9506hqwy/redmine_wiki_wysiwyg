import { expect, test } from "@playwright/test";
import { newPage, screenshot } from "./utils";

test.describe.configure({ mode: "serial" });

test("delete project", async ({ browser, browserName }) => {
  const page = await newPage(browser, browserName);

  if (/^4\.(0|1)\./.test(process.env.REDMINE_VERSION || "")) {
    await page.goto("http://localhost:3000/admin/projects");

    const delButton = page.locator(
      `a.icon-del[href="/projects/test_project_${browserName}"]`,
    );
    await delButton.click();

    const confirm = page.locator("input#confirm");
    await confirm.check();

    const submit = page.locator('input[name="commit"]');
    await submit.click();
  } else {
    await page.goto(
      `http://localhost:3000/projects/test_project_${browserName}`,
    );

    const actionsButton = page.locator("div.contextual span.drdn-trigger");
    await actionsButton.click();

    const delButton = page.locator("div.drdn-content a.icon-del");
    await delButton.click();

    const confirm = page.locator("input#confirm");
    await confirm.fill(`test_project_${browserName}`);

    const submit = page.locator('input[name="commit"]');
    await submit.click();

    if (!/^(4|5\.0)\./.test(process.env.REDMINE_VERSION || "")) {
      await expect(page.locator("div#flash_notice")).toBeVisible();
    }
  }

  await screenshot(page, `delete_project_${browserName}`);
});
