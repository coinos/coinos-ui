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
} from "./helpers";

test("bob receives 100 sats in ark vault after server wallet send", async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for /test/ark/send");

  await login(page, bobUsername, bobPassword);
  await ensureArkAccount(page, arkWalletPassword);

  // Navigate back to dashboard after account setup
  await page.goto(`/${bobUsername}`);
  await page.waitForLoadState("networkidle");

  const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
  console.log(`[e2e] Bob ark address: ${address}, invoice: ${invoiceId}`);

  await sendArkFromTestEndpoint(page, address, 100, invoiceId);

  const status = await waitForInvoicePaid(page, invoiceId, 100);
  expect(status.received).toBeGreaterThanOrEqual(100);

  console.log(
    `[e2e] ark invoice ${invoiceId} funded with 100 sats (received=${status?.received || 0})`,
  );
});
