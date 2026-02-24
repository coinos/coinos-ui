import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  loginNewContext,
  lightningInvoice,
  pasteAndSend,
  clickSendButton,
  waitForSentRedirect,
} from "./helpers";

test("custodial sends to external lightning node (clb) via bolt11", async ({ browser }) => {
  test.setTimeout(90_000);

  // --- Create bolt11 on external node (clb) ---
  const label = `e2e-ext-ln-${Date.now()}`;
  const bolt11 = lightningInvoice(1000_000, label); // 1000 sats in msats
  console.log(`[e2e] External bolt11: ${bolt11.substring(0, 40)}...`);

  // --- Bob: paste bolt11 and send ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  await pasteAndSend(bobPage, bolt11);

  const bobUrl = bobPage.url();
  console.log(`[e2e] Bob navigated to: ${bobUrl}`);

  // Should go to /send/lightning/{bolt11} for external lightning
  expect(bobUrl).toContain("/send/lightning/");

  // Lightning invoice has amount embedded — Send button should be visible
  // The page may show an error or advanced settings (maxfee)
  // Click Send (the main submit button)
  const sendButton = bobPage.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });

  // Check for error message before clicking Send
  const errorText = await bobPage
    .locator(".text-red-600")
    .first()
    .innerText({ timeout: 1000 })
    .catch(() => "");
  if (errorText) {
    console.log(`[e2e] Page error before send: ${errorText}`);
  }

  await sendButton.click();

  await waitForSentRedirect(bobPage, 60_000);
  console.log(`[e2e] Bob external LN payment sent: ${bobPage.url()}`);

  await bobContext.close();
});
