import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
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
  waitForPageReady,
} from "./helpers";

test("vault sends to own custodial account", async ({ page }) => {
  test.slow();
  test.setTimeout(180_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

  // --- Login and ensure ark account ---
  await login(page, bobUsername, bobPassword);
  await ensureArkAccount(page, arkWalletPassword);

  // --- Fund vault via /test/ark/send ---
  await page.goto(`/${bobUsername}`);
  await waitForDashboard(page);

  const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
  console.log(`[e2e] Bob vault address: ${address}, invoice: ${invoiceId}`);

  await sendArkFromTestEndpoint(page, address, 100, invoiceId);
  await waitForInvoicePaid(page, invoiceId, 100);
  console.log("[e2e] Vault funded with 100 sats");

  // --- Send vault → custodial (self-send to own username) ---
  await page.goto(`/pay/${bobUsername}`);
  await waitForPageReady(page);

  // Should redirect to /send/ark/{serverAddr}/{amount} or similar vault→custodial path
  // The UI detects vault→custodial and routes accordingly
  await page.waitForURL(/\/send\//, { timeout: 15_000 });
  console.log(`[e2e] Bob on send page: ${page.url()}`);

  // Enter amount
  await fillNumpadAmount(page, 100);

  // Handle WalletPass modal if it appears
  const walletPassInput = page.getByTestId("walletpass-input");
  if (await walletPassInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await walletPassInput.fill(arkWalletPassword);
    await page.getByTestId("walletpass-submit").click();
  }

  // Confirm send
  const sendButton = page.locator('button[type="submit"]');
  if (await sendButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await sendButton.click();
  }

  await waitForSendComplete(page, 90_000);
  console.log(`[e2e] Vault→custodial payment sent: ${page.url()}`);
});
