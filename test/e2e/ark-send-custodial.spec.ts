import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  testSecret,
  arkWalletPassword,
  loginNewContext,
  ensureArkAccount,
  createArkInvoiceViaUI,
  fillNumpadAmount,
  waitForSendComplete,
  waitForDashboard,
} from "./helpers";

test("custodial sends to external ark address", async ({ browser }) => {
  test.setTimeout(120_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

  // --- Alice: log in, ensure ark account, get her ark vault address ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  await ensureArkAccount(alicePage, arkWalletPassword);
  await alicePage.goto(`/${aliceUsername}`);
  await waitForDashboard(alicePage);

  const { address: arkAddress } = await createArkInvoiceViaUI(alicePage, arkWalletPassword);
  console.log(`[e2e] Alice ark address: ${arkAddress}`);

  await aliceContext.close();

  // --- Bob: paste ark address and send from custodial ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  // Navigate directly to the ark send page (pasteAndSend can be flaky with tark addresses)
  await bobPage.goto(`/send/ark/${arkAddress}`);
  await bobPage.waitForLoadState("domcontentloaded");
  console.log(`[e2e] Bob navigated to: ${bobPage.url()}`);

  // Enter amount on numpad
  await fillNumpadAmount(bobPage, 100);

  // Now on the confirmation page with Send button
  await bobPage.waitForURL(/\/send\/ark\/[^/]+\/\d+/, { timeout: 10_000 });
  console.log(`[e2e] Bob on ark send confirmation: ${bobPage.url()}`);

  const sendButton = bobPage.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  await waitForSendComplete(bobPage, 60_000);
  console.log(`[e2e] Bob ark payment sent: ${bobPage.url()}`);

  await bobContext.close();
});
