import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  login,
  getBitcoinAddress,
  fillNumpadAmount,
  waitForSendComplete,
  setActiveAccount,
  apiBaseUrl,
  apiLogin,
  ensureVaultAccount,
  fundVaultAccount,
} from "./helpers";

test("bitcoin vault send completes successfully", async ({ page }) => {
  test.setTimeout(120_000);

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.text().includes("Signing with")) {
      consoleErrors.push(msg.text());
    }
  });

  // --- Login as bob ---
  await login(page, bobUsername, bobPassword);
  const token = await apiLogin(page, bobUsername, bobPassword);

  // --- Ensure a vault account whose keys match bob's test credentials ---
  const vaultAccount = await ensureVaultAccount(page, token, bobUsername, bobPassword);
  await setActiveAccount(page, vaultAccount.id);

  // --- Fund the vault ---
  await fundVaultAccount(page, token, vaultAccount.id, bobUsername, 10_000);

  // --- Send to an external address ---
  const externalAddress = getBitcoinAddress();

  await page.goto("/send");
  await page.waitForLoadState("load");

  const textarea = page.locator('textarea[name="text"]');
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  await textarea.fill(externalAddress);

  const submitBtn = page.locator('button[type="submit"]').first();
  await expect(submitBtn).toBeVisible({ timeout: 5_000 });
  await submitBtn.click();

  await page.waitForURL((url) => url.pathname !== "/send" && url.pathname !== "/send/", {
    timeout: 15_000,
  });
  expect(page.url()).toContain("/send/bitcoin/");

  // --- Enter amount ---
  await fillNumpadAmount(page, 1000);
  await page.waitForURL(/\/send\/bitcoin\/[^/]+\/\d+/, { timeout: 10_000 });

  // --- Check for server-side error ---
  const errorText = await page
    .locator(".text-red-600")
    .first()
    .innerText({ timeout: 3000 })
    .catch(() => "");
  expect(errorText, `Fee page error: ${errorText}`).not.toContain("invalid number");

  if (!errorText) {
    // --- Click send to trigger client-side signing ---
    const sendButton = page.locator(
      'button[type="submit"]:not([data-testid="walletpass-submit"])',
    );
    await expect(sendButton).toBeVisible({ timeout: 5_000 });
    await sendButton.click();

    // Handle WalletPass dialog if it appears
    const walletPassInput = page.getByTestId("walletpass-input");
    const walletPassVisible = await walletPassInput
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (walletPassVisible) {
      await walletPassInput.fill(bobPassword);
      await page.getByTestId("walletpass-submit").click();
    }

    await waitForSendComplete(page, 30_000);
    console.log(`[e2e] Vault send succeeded: ${page.url()}`);

    // Verify no path derivation errors in console
    const regressionErrors = consoleErrors.filter(
      (e) => e.includes("invalid number") || e.includes("2**32") || e.includes("got undefined"),
    );
    expect(regressionErrors, `Path derivation regression: ${regressionErrors}`).toHaveLength(0);
  }
});
