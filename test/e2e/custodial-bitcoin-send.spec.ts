import { expect, test } from "@playwright/test";

const aliceUsername = process.env.E2E_ALICE_USERNAME || "alice";
const alicePassword = process.env.E2E_ALICE_PASSWORD || "pw";
const bobUsername = process.env.E2E_BOB_USERNAME || "bob";
const bobPassword = process.env.E2E_BOB_PASSWORD || "pw";

test("custodial-to-custodial via bitcoin address sends internally and notifies recipient", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  // --- Alice: create a bitcoin receive invoice on her custodial account ---
  const aliceContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();

  await alicePage.goto("/login");
  await alicePage.getByTestId("login-username").fill(aliceUsername);
  await alicePage.locator('input[name="password"]').first().fill(alicePassword);
  await alicePage.getByTestId("login-submit").click();
  await expect(alicePage).toHaveURL(
    new RegExp(`/${aliceUsername}(?:[/?#]|$)`),
    { timeout: 15_000 },
  );

  // Navigate to receive page with bitcoin address type to auto-create a bitcoin invoice
  await alicePage.goto(`/${aliceUsername}/receive?address_type=bech32`);

  // Wait for redirect to /invoice/{id} (setType fires on mount and creates a bitcoin invoice)
  await alicePage.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });

  // Grab the invoice URL and ID
  const aliceInvoiceUrl = alicePage.url();
  const invoiceId = aliceInvoiceUrl.match(/\/invoice\/([^/?#]+)/)?.[1];
  expect(invoiceId, "Should have invoice ID in URL").toBeTruthy();

  // Grab the bitcoin address from the invoice text
  const invoiceText = await alicePage
    .getByTestId("invoice-text")
    .first()
    .innerText({ timeout: 10_000 });
  const bitcoinAddress = invoiceText.trim().replace(/\s+/g, "");
  expect(
    bitcoinAddress.startsWith("bcrt1") || bitcoinAddress.startsWith("bc1"),
    `Expected bitcoin address, got: ${bitcoinAddress}`,
  ).toBeTruthy();

  console.log(`[e2e] Alice custodial bitcoin address: ${bitcoinAddress}`);
  console.log(`[e2e] Alice invoice ID: ${invoiceId}`);

  // Alice stays on the invoice page — she's subscribed to notifications via websocket

  // --- Bob: paste Alice's bitcoin address and send internally ---
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  await bobPage.goto("/login");
  await bobPage.waitForLoadState("networkidle");
  await bobPage.getByTestId("login-username").fill(bobUsername);
  await bobPage.locator('input[name="password"]').first().fill(bobPassword);
  await bobPage.getByTestId("login-submit").click();
  await expect(bobPage).toHaveURL(
    new RegExp(`/${bobUsername}(?:[/?#]|$)`),
    { timeout: 15_000 },
  );

  // Navigate to send page
  await bobPage.goto("/send");
  await bobPage.waitForURL(/\/send/);

  // Paste Alice's bitcoin address
  const textarea = bobPage.locator('textarea[name="text"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });
  await textarea.fill(bitcoinAddress);
  await bobPage.locator('button[type="submit"]').first().click();

  // Wait for navigation — should go to /send/invoice/ (not /pay/alice or /send/bitcoin)
  await bobPage.waitForURL(
    (url) => url.pathname !== "/send" && url.pathname !== "/send/",
    { timeout: 15_000 },
  );

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
  // If swap button shows a fiat amount (not sats), we're in sats mode already
  // If it shows sats (⚡), we're in fiat mode — click to swap to sats
  if (swapText.includes("⚡") || swapText.includes("lightning")) {
    await swapButton.click();
  }

  // Type amount using keyboard - click the contenteditable, clear it, type 1000
  await amountInput.click();
  await bobPage.keyboard.press("Control+a");
  await bobPage.keyboard.type("1000");

  // Click "Next" to set the amount (the submit button bound to Numpad)
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
