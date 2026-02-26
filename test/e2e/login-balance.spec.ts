import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword } from "./helpers";

const username = process.env.E2E_USERNAME || bobUsername;
const password = process.env.E2E_PASSWORD || bobPassword;

test("login and report account balance", async ({ page }) => {
  await login(page, username, password);

  const balances = page.getByTestId("balance-value");
  await expect(balances.first()).toBeVisible();

  const balanceText = (await balances.first().innerText()).trim();
  const hasNumericBalance = /\d/.test(balanceText);
  expect(hasNumericBalance).toBeTruthy();

  console.log(`[e2e] ${username} visible balance: ${balanceText}`);
});
