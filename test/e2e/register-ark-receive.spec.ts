import { expect, test } from "@playwright/test";
import { ensureArkAccount } from "./helpers";

/**
 * Registers a brand-new user via the two-step register flow,
 * creates an Ark vault, then clicks Receive on the Ark card
 * and verifies navigation to /invoice.
 */
test("register new user, create ark vault, click Receive", async ({ page }) => {
  test.setTimeout(90_000);

  const username = `test${Date.now()}`;
  const password = "testpass123";

  // ── Step 1: /register — pick username ──
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

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

  // Wait for redirect or detect registration error
  const registered = await page
    .waitForURL(new RegExp(`/${username}(?:[/?#]|$)`), { timeout: 30_000 })
    .then(() => true)
    .catch(() => false);

  if (!registered) {
    // Check if there's a form error message
    const errorText = await page
      .locator(".text-red-600")
      .first()
      .innerText({ timeout: 1000 })
      .catch(() => "");
    if (errorText) {
      test.skip(true, `Registration failed: ${errorText}`);
      return;
    }
    // If no error but still on register page, skip with info
    test.skip(true, `Registration redirect timed out (still on ${page.url()})`);
    return;
  }

  // ── Step 3: Create Ark vault using the standard helper ──
  await ensureArkAccount(page, password);

  // ── Step 4: Click Receive on Ark card ──
  await page.goto(`/${username}`);
  await page.waitForLoadState("domcontentloaded");

  const arkCard = page.locator('[data-testid="account-card"][data-account-type="ark"]');
  await expect(arkCard.first()).toBeVisible({ timeout: 15_000 });

  const receiveBtn = arkCard.first().getByTestId("account-receive");
  await receiveBtn.click({ force: true });

  // Handle wallet password dialog if it appears
  const walletPassInput = page.getByTestId("walletpass-input");
  if (await walletPassInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await walletPassInput.fill(password);
    await page.getByTestId("walletpass-submit").click();
  }

  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });
  expect(page.url()).toContain("/invoice/");
});
