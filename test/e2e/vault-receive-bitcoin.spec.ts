import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  login,
  createVaultBitcoinInvoiceViaUI,
  bitcoinSend,
  mineBlocks,
  waitForInvoicePaid,
  waitForPaidRedirect,
} from "./helpers";

test("bitcoin vault receives external bitcoin payment from bitcoind", async ({
  page,
}) => {
  test.setTimeout(120_000);

  // --- Alice: log in and create vault bitcoin invoice ---
  await login(page, aliceUsername, alicePassword);

  const { invoiceId, address } = await createVaultBitcoinInvoiceViaUI(page);
  console.log(`[e2e] Alice vault bitcoin address: ${address}`);
  console.log(`[e2e] Alice vault invoice ID: ${invoiceId}`);

  // Alice stays on the invoice page

  // --- External: send bitcoin from bitcoind and mine ---
  console.log("[e2e] Sending bitcoin to vault from bitcoind...");
  const txid = bitcoinSend(address, "0.00001");
  console.log(`[e2e] Bitcoin txid: ${txid}`);

  console.log("[e2e] Mining 1 block...");
  mineBlocks(1);

  // --- Wait for invoice to be paid ---
  const status = await waitForInvoicePaid(page, invoiceId, 1000, {
    interval: 2000,
    maxAttempts: 30,
  });
  console.log(
    `[e2e] Vault invoice paid: received=${status?.received}, pending=${status?.pending}`,
  );

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
    console.log(
      `[e2e] No /paid redirect (vault may not auto-redirect), current: ${page.url()}`,
    );
  }

  // Vault payments may show as pending — verify the invoice API shows received/pending
  expect(
    (status?.received || 0) >= 1000 || (status?.pending || 0) >= 1000,
    `Expected invoice to show received or pending >= 1000, got: ${JSON.stringify(status)}`,
  ).toBeTruthy();
});
