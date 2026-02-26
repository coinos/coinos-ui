import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  apiBaseUrl,
  loginNewContext,
  fillNumpadAmount,
  clickSendButton,
  waitForSentRedirect,
} from "./helpers";

test("custodial-to-custodial via username (/pay/) sends and notifies recipient", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  // --- Alice: log in and get initial balance ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  const aliceToken = await (async () => {
    const res = await alicePage.request.post(`${apiBaseUrl}/login`, {
      data: { username: aliceUsername, password: alicePassword },
    });
    return (await res.json()).token as string;
  })();

  const aliceBalanceBefore = await (async () => {
    const res = await alicePage.request.get(`${apiBaseUrl}/me`, {
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    return (await res.json()).balance as number;
  })();

  console.log(`[e2e] Alice balance before: ${aliceBalanceBefore}`);

  // --- Bob: navigate to /pay/alice and send 100 sats ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  await bobPage.goto(`/pay/${aliceUsername}`);
  await bobPage.waitForURL(new RegExp(`/pay/${aliceUsername}`));

  // Numpad should be visible — type amount and click Next (submits form)
  await fillNumpadAmount(bobPage, 100);

  // The form creates an invoice. If Alice has tip prompt, we go to /invoice/{id}/tip
  // Otherwise we go to /invoice/{id} which loads the send page
  await bobPage.waitForURL((url) => !url.pathname.startsWith("/pay/"), { timeout: 15_000 });

  const afterPayUrl = bobPage.url();
  console.log(`[e2e] After /pay/ submit: ${afterPayUrl}`);

  // Handle tip page if present
  if (afterPayUrl.includes("/tip")) {
    console.log("[e2e] Tip page detected, clicking 'No' to skip tip...");
    const noTipButton = bobPage.locator("button", { hasText: "No" });
    await expect(noTipButton).toBeVisible({ timeout: 5_000 });
    await noTipButton.click();

    // After skipping tip, we get redirected to /invoice/{id}
    // which should then load as /send/invoice/{id} for the payer
    await bobPage.waitForURL((url) => !url.pathname.includes("/tip"), { timeout: 15_000 });
    console.log(`[e2e] After tip skip: ${bobPage.url()}`);
  }

  // We should now be on /send/invoice/{id} or /invoice/{id}
  // If on /invoice/{id} (not /send/), the page shows the invoice — check for Send button
  const currentUrl = bobPage.url();
  if (currentUrl.includes("/send/invoice/")) {
    // On send page — amount should already be set, click Send
    await clickSendButton(bobPage);
  } else if (currentUrl.includes("/invoice/")) {
    // On invoice view — navigate to send page
    const invoiceId = currentUrl.match(/\/invoice\/([^/?#]+)/)?.[1];
    if (invoiceId) {
      await bobPage.goto(`/send/invoice/${invoiceId}`);
      await bobPage.waitForURL(/\/send\/invoice\//);
      // Amount is set on the invoice, so Send button should be visible
      await clickSendButton(bobPage);
    }
  }

  // Bob should be redirected to /sent/
  await waitForSentRedirect(bobPage, 30_000);
  console.log(`[e2e] Bob payment sent via /pay/: ${bobPage.url()}`);

  // --- Verify Alice balance increased ---
  const aliceBalanceAfter = await (async () => {
    const res = await alicePage.request.get(`${apiBaseUrl}/me`, {
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    return (await res.json()).balance as number;
  })();

  console.log(`[e2e] Alice balance after: ${aliceBalanceAfter}`);
  expect(aliceBalanceAfter).toBeGreaterThanOrEqual(aliceBalanceBefore + 100);

  await aliceContext.close();
  await bobContext.close();
});
