import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  loginNewContext,
  getBitcoinAddress,
  pasteAndSend,
  fillNumpadAmount,
  waitForSentRedirect,
} from "./helpers";

test("custodial sends to external bitcoin address (bitcoind)", async ({ browser }) => {
  test.setTimeout(90_000);

  // --- Get external bitcoin address from 'external' wallet (NOT 'coinos' hot wallet) ---
  const externalAddress = getBitcoinAddress();
  console.log(`[e2e] External bitcoin address: ${externalAddress}`);

  // --- Bob: paste address and send ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  await pasteAndSend(bobPage, externalAddress);

  const bobUrl = bobPage.url();
  console.log(`[e2e] Bob navigated to: ${bobUrl}`);

  // Should go to /send/bitcoin/{address} for external bitcoin
  expect(bobUrl).toContain("/send/bitcoin/");

  // Numpad for amount
  await fillNumpadAmount(bobPage, 1000);

  // Now on the fee page
  await bobPage.waitForURL(/\/send\/bitcoin\/[^/]+\/\d+/, { timeout: 10_000 });
  console.log(`[e2e] Bob on fee page: ${bobPage.url()}`);

  // Check for error message on the fee page (load error from /bitcoin/fee)
  const loadError = await bobPage
    .locator(".text-red-600")
    .first()
    .innerText({ timeout: 1000 })
    .catch(() => "");
  if (loadError) {
    console.log(`[e2e] Fee page error: ${loadError}`);
  }
  expect(loadError, `Fee page should not show error: ${loadError}`).toBeFalsy();

  // Click Send
  const sendButton = bobPage.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  await waitForSentRedirect(bobPage, 30_000);
  console.log(`[e2e] Bob external BTC payment sent: ${bobPage.url()}`);

  await bobContext.close();
});
