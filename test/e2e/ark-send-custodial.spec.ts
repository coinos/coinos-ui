import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  testSecret,
  apiBaseUrl,
  loginNewContext,
  createArkInvoiceViaUI,
  pasteAndSend,
  fillNumpadAmount,
  waitForSentRedirect,
} from "./helpers";

test("custodial sends to external ark address", async ({ browser }) => {
  test.setTimeout(120_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

  // --- Alice: log in and get her ark vault address ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  const { address: arkAddress } = await createArkInvoiceViaUI(alicePage, alicePassword);
  console.log(`[e2e] Alice ark address: ${arkAddress}`);

  await aliceContext.close();

  // --- Bob: paste ark address and send from custodial ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  await pasteAndSend(bobPage, arkAddress);

  const bobUrl = bobPage.url();
  console.log(`[e2e] Bob navigated to: ${bobUrl}`);

  // Should route to /send/ark/{address}
  expect(bobUrl).toContain("/send/ark/");

  // Enter amount on numpad
  await fillNumpadAmount(bobPage, 1000);

  // Now on the confirmation page with Send button
  await bobPage.waitForURL(/\/send\/ark\/[^/]+\/\d+/, { timeout: 10_000 });
  console.log(`[e2e] Bob on ark send confirmation: ${bobPage.url()}`);

  const sendButton = bobPage.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  await waitForSentRedirect(bobPage, 60_000);
  console.log(`[e2e] Bob ark payment sent: ${bobPage.url()}`);

  await bobContext.close();
});
