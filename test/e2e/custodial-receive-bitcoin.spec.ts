import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  login,
  createBitcoinInvoiceViaUI,
  bitcoinSend,
  mineBlocks,
  waitForInvoicePaid,
  waitForPaidRedirect,
} from "./helpers";

test("custodial receives external bitcoin payment from bitcoind", async ({ page }) => {
  test.setTimeout(120_000);

  // --- Alice: log in and create bitcoin invoice ---
  await login(page, aliceUsername, alicePassword);

  const { invoiceId, address } = await createBitcoinInvoiceViaUI(page, aliceUsername);
  console.log(`[e2e] Alice bitcoin address: ${address}`);
  console.log(`[e2e] Alice invoice ID: ${invoiceId}`);

  // Alice stays on the invoice page

  // --- External: send bitcoin from bitcoind and mine ---
  console.log("[e2e] Sending bitcoin from bitcoind...");
  const txid = bitcoinSend(address, "0.00001");
  console.log(`[e2e] Bitcoin txid: ${txid}`);

  console.log("[e2e] Mining 1 block...");
  mineBlocks(1);

  // --- Wait for invoice to be paid ---
  const status = await waitForInvoicePaid(page, invoiceId, 1000, {
    interval: 2000,
    maxAttempts: 30,
  });
  console.log(`[e2e] Invoice paid: received=${status?.received}, pending=${status?.pending}`);

  // --- Alice: should be redirected to /paid ---
  await waitForPaidRedirect(page, invoiceId, 30_000);
  console.log(`[e2e] Alice redirected to paid: ${page.url()}`);

  const successText = await page.locator("h1").first().innerText({ timeout: 5_000 });
  expect(
    successText.toLowerCase().includes("payment") ||
      successText.toLowerCase().includes("success") ||
      successText.toLowerCase().includes("detected"),
    `Expected payment success text, got: ${successText}`,
  ).toBeTruthy();
});
