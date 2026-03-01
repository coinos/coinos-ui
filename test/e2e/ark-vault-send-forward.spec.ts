import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  testSecret,
  arkWalletPassword,
  login,
  ensureArkAccount,
  createArkInvoiceViaUI,
  sendArkFromTestEndpoint,
  waitForInvoicePaid,
  fillNumpadAmount,
  waitForSendComplete,
  waitForDashboard,
  dockerExec,
} from "./helpers";

function getLiquidAddress(): string {
  return dockerExec("lq", "elements-cli getnewaddress");
}

test("vault sends to external Liquid address via forward", async ({ page }) => {
  test.slow();
  test.setTimeout(180_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

  // --- Login and ensure ark account ---
  await login(page, aliceUsername, alicePassword);
  await ensureArkAccount(page, arkWalletPassword);

  // --- Fund vault ---
  await page.goto(`/${aliceUsername}`);
  await waitForDashboard(page);

  const { invoiceId, address: arkAddress } = await createArkInvoiceViaUI(
    page,
    arkWalletPassword,
  );
  console.log(`[e2e] Alice vault address: ${arkAddress}, invoice: ${invoiceId}`);

  const fundAmount = 2000;
  await sendArkFromTestEndpoint(page, arkAddress, fundAmount, invoiceId);
  await waitForInvoicePaid(page, invoiceId, fundAmount);
  console.log(`[e2e] Vault funded with ${fundAmount} sats`);

  // --- Get an external Liquid address ---
  const liquidAddress = getLiquidAddress();
  console.log(`[e2e] External Liquid address: ${liquidAddress}`);

  // --- Navigate to send page with the Liquid address ---
  await page.goto(`/${aliceUsername}`);
  await waitForDashboard(page);

  // Set the ark account as active so the send uses the vault
  const arkCard = page.locator('[data-testid="account-card"][data-account-type="ark"]');
  await expect(arkCard.first()).toBeVisible({ timeout: 10_000 });

  // Paste the liquid address and navigate to send flow
  await page.goto("/send");
  await page.waitForURL(/\/send/);

  const textarea = page.locator('textarea[name="text"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });
  await textarea.fill(liquidAddress);
  await page.locator('button[type="submit"]').first().click();

  // Should navigate to /send/bitcoin/{address} or similar
  await page.waitForURL(/\/send\/bitcoin\//, { timeout: 15_000 });
  console.log(`[e2e] On send amount page: ${page.url()}`);

  // Enter send amount
  const sendAmount = 1000;
  await fillNumpadAmount(page, sendAmount);

  // Should navigate to confirmation page
  await page.waitForURL(/\/send\/bitcoin\/.*\/\d+/, { timeout: 15_000 });
  console.log(`[e2e] On confirmation page: ${page.url()}`);

  // Handle WalletPass modal if it appears
  const walletPassInput = page.getByTestId("walletpass-input");
  if (await walletPassInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await walletPassInput.fill(arkWalletPassword);
    await page.getByTestId("walletpass-submit").click();
  }

  // Click send
  const sendButton = page.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  // Wait for redirect to /sent/ or detect error (fails fast on send error)
  await waitForSendComplete(page, 90_000);
  console.log(`[e2e] Vault→Liquid forward payment sent: ${page.url()}`);

  // Verify we landed on the sent page with a valid payment ID
  const sentMatch = page.url().match(/\/sent\/([^/?#]+)/);
  expect(sentMatch, "Should have payment ID in /sent/ URL").toBeTruthy();
  console.log(`[e2e] Payment ID: ${sentMatch![1]}`);
});
