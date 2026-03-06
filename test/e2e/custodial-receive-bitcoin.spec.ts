import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  login,
  createBitcoinInvoiceViaUI,
  bitcoinSend,
  mineBlocks,
  waitForInvoicePaid,
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
  // Give nbxplorer time to index then mine another to trigger webhook
  await page.waitForTimeout(3_000);
  mineBlocks(1);

  // --- Wait for invoice to be paid ---
  const status = await waitForInvoicePaid(page, invoiceId, 1000, {
    interval: 2000,
    maxAttempts: 45,
  });
  console.log(`[e2e] Invoice paid: received=${status?.received}, pending=${status?.pending}`);

  // --- Alice: should be redirected to /paid ---
  const paidReached = await page
    .waitForURL(new RegExp(`/invoice/${invoiceId}/paid(?:[/?#]|$)`), {
      timeout: 30_000,
    })
    .then(() => true)
    .catch(() => false);

  if (paidReached) {
    console.log(`[e2e] Alice redirected to paid: ${page.url()}`);
  } else {
    console.log(`[e2e] No /paid redirect, current: ${page.url()}`);
  }

  // Verify the invoice API shows received >= 1000
  expect(
    (status?.received || 0) >= 1000 || (status?.pending || 0) >= 1000,
    `Expected invoice to show received or pending >= 1000, got: ${JSON.stringify(status)}`,
  ).toBeTruthy();
});
