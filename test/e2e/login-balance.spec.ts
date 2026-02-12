import { expect, test } from "@playwright/test";

const username = process.env.E2E_USERNAME || "bob";
const password = process.env.E2E_PASSWORD || "pw";

test("login and report account balance", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("login-username").fill(username);
  await page.locator('input[name="password"]').first().fill(password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(new RegExp(`/${username}(?:[/?#]|$)`));

  const balances = page.getByTestId("balance-value");
  await expect(balances.first()).toBeVisible();

  const balanceText = (await balances.first().innerText()).trim();
  const hasNumericBalance = /\d/.test(balanceText);
  expect(hasNumericBalance).toBeTruthy();

  console.log(`[e2e] ${username} visible balance: ${balanceText}`);
});
