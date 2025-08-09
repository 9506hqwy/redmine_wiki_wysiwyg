import { expect, test } from "@playwright/test";
import { screenshot } from "./utils";

test("initialize", async ({ page, browserName }) => {
  await page.goto("http://localhost:3000/");
  await expect(page.locator("a.login")).toBeVisible();

  await page.locator("a.login").click();
  await expect(page.locator("input#login-submit")).toBeVisible();

  await page.locator("input#username").fill("admin");
  await page.locator("input#password").fill("admin");
  await page.locator("input#login-submit").click();

  await page.locator("input#password").fill("admin");
  await page.locator("input#new_password").fill("redmineadmin");
  await page.locator("input#new_password_confirmation").fill("redmineadmin");
  await page.locator('input[name="commit"]').click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `initialize_${browserName}`);

  await page.goto("http://localhost:3000/settings");

  if (/^4\./.test(process.env.REDMINE_VERSION || "")) {
    await page
      .locator("select#settings_text_formatting")
      .selectOption("markdown");
  } else {
    await page
      .locator("select#settings_text_formatting")
      .selectOption("common_mark");
  }

  await page.locator('div#tab-content-general input[name="commit"]').click();

  await expect(page.locator("div#flash_notice")).toBeVisible();

  await screenshot(page, `configuration_${browserName}`);
});
