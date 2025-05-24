import { test } from "@playwright/test";
import { screenshot } from "./utils";

test("initialize", async ({ page, browserName }) => {
  await page.goto("http://localhost:3000/");
  await page.locator("a.login").click();

  await page.locator("input#username").fill("admin");
  await page.locator("input#password").fill("admin");
  await page.locator("input#login-submit").click();

  await page.locator("input#password").fill("admin");
  await page.locator("input#new_password").fill("redmineadmin");
  await page.locator("input#new_password_confirmation").fill("redmineadmin");
  await page.locator('input[name="commit"]').click();

  await screenshot(page, `initialize_${browserName}`);
});
