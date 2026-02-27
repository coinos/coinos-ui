import { expect, test } from "@playwright/test";

/**
 * Registers a brand-new user via the two-step register flow,
 * creates an Ark vault, then clicks Receive on the Ark card
 * and verifies navigation to /invoice.
 */
test("register new user, create ark vault, click Receive", async ({ page }) => {
  test.setTimeout(60_000);

  const username = `test${Date.now()}`;
  const password = "testpass123";

  // ── Step 1: /register — pick username ──
  await page.goto("/register");
  await page.waitForLoadState("networkidle");

  const usernameInput = page.locator('input[name="username"]');
  await expect(usernameInput).toBeVisible({ timeout: 5_000 });
  await usernameInput.fill(username);

  const continueBtn = page.locator("button.btn-accent", { hasText: "Continue" });
  await continueBtn.click();

  await page.waitForURL(/\/register\/auth\?/, { timeout: 10_000 });

  // ── Step 2: /register/auth — register with password ──
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 5_000 });
  await passwordInput.fill(password);

  const registerBtn = page.locator("button.btn-accent[type='submit']");
  await registerBtn.click();

  await page.waitForURL(new RegExp(`/${username}(?:[/?#]|$)`), { timeout: 30_000 });

  // ── Step 3: Create Ark vault ──
  await page.goto("/account/ark");
  await page.waitForURL((u) => !u.pathname.includes("/account/ark"), { timeout: 30_000 });

  // ── Step 4: Click Receive on Ark card ──
  await page.goto(`/${username}`);
  await page.waitForLoadState("networkidle");

  const arkCard = page.locator('[data-testid="account-card"][data-account-type="ark"]');
  await expect(arkCard.first()).toBeVisible({ timeout: 10_000 });

  const receiveBtn = arkCard.first().getByTestId("account-receive");
  await receiveBtn.click();

  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });
  expect(page.url()).toContain("/invoice/");
});
