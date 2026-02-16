import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  loginNewContext,
  createBitcoinInvoiceViaUI,
  pasteAndSend,
} from "./helpers";

test("custodial-to-custodial via bitcoin address sends internally and notifies recipient", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  // --- Alice: create a bitcoin receive invoice on her custodial account ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  const { invoiceId, address: bitcoinAddress } =
    await createBitcoinInvoiceViaUI(alicePage, aliceUsername);

  console.log(`[e2e] Alice custodial bitcoin address: ${bitcoinAddress}`);
  console.log(`[e2e] Alice invoice ID: ${invoiceId}`);

  // Alice stays on the invoice page — she's subscribed to notifications via websocket

  // --- Bob: paste Alice's bitcoin address and send internally ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  // Navigate to send page and paste Alice's address
  await pasteAndSend(bobPage, bitcoinAddress);

  const bobUrl = bobPage.url();
  console.log(`[e2e] Bob navigated to: ${bobUrl}`);

  // Verify it went to /send/invoice/ (internal send via original invoice)
  expect(
    bobUrl,
    `Expected /send/invoice/ URL but got: ${bobUrl}`,
  ).toContain("/send/invoice/");
  expect(
    bobUrl,
    `Should NOT redirect to /pay/ but got: ${bobUrl}`,
  ).not.toContain("/pay/");

  // Bob should see the Numpad (no amount set on the invoice)
  const amountInput = bobPage.locator('[aria-label="Amount input"]');
  await expect(amountInput).toBeVisible({ timeout: 5_000 });

  // Switch to sats mode if in fiat mode (click swap if lightning icon is not visible next to input)
  const swapButton = bobPage.locator('[aria-label="Swap currency display"]');
  const swapText = await swapButton.innerText();
  if (swapText.includes("⚡") || swapText.includes("lightning")) {
    await swapButton.click();
  }

  // Type amount using keyboard
  await amountInput.click();
  await bobPage.keyboard.press("Control+a");
  await bobPage.keyboard.type("1000");

  // Click "Next" to set the amount
  const nextButton = bobPage.locator('button[type="button"].btn-accent');
  await expect(nextButton).toBeVisible({ timeout: 5_000 });
  await nextButton.click();

  // Now the Send button should appear
  const sendButton = bobPage.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  // Bob should be redirected to /sent/ after successful payment
  await bobPage.waitForURL(/\/sent\//, { timeout: 15_000 });
  console.log(`[e2e] Bob payment sent: ${bobPage.url()}`);

  // --- Verify Alice receives notification and is redirected to /paid ---
  await alicePage.waitForURL(/\/invoice\/.*\/paid/, { timeout: 30_000 });
  console.log(`[e2e] Alice redirected to: ${alicePage.url()}`);

  // Verify Alice sees the payment success page
  const successText = await alicePage.locator("h1").first().innerText({ timeout: 5_000 });
  expect(
    successText.toLowerCase().includes("payment") || successText.toLowerCase().includes("success") || successText.toLowerCase().includes("detected"),
    `Expected payment success text, got: ${successText}`,
  ).toBeTruthy();

  await aliceContext.close();
  await bobContext.close();
});
