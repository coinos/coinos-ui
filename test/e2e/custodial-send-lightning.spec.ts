import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  apiBaseUrl,
  loginNewContext,
  pasteAndSend,
  clickSendButton,
  waitForSentRedirect,
  waitForPaidRedirect,
} from "./helpers";

test("custodial-to-custodial via lightning bolt11 sends internally and notifies recipient", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  // --- Alice: log in and create a lightning invoice with amount via API ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  // Get auth token
  const tokenRes = await alicePage.request.post(`${apiBaseUrl}/login`, {
    data: { username: aliceUsername, password: alicePassword },
  });
  const { token } = await tokenRes.json();

  // Create lightning invoice with amount 1000 sats
  const invoiceRes = await alicePage.request.post(`${apiBaseUrl}/invoice`, {
    headers: { authorization: `Bearer ${token}` },
    data: {
      invoice: { type: "lightning", amount: 1000 },
      user: { username: aliceUsername },
    },
  });
  const { id: invoiceId } = await invoiceRes.json();
  expect(invoiceId).toBeTruthy();

  // Get the bolt11 payreq
  const invDetailRes = await alicePage.request.get(
    `${apiBaseUrl}/invoice/${invoiceId}`,
  );
  const invDetail = await invDetailRes.json();
  const bolt11 = invDetail.text;
  expect(bolt11).toBeTruthy();
  console.log(
    `[e2e] Alice bolt11 invoice: ${invoiceId}, bolt11: ${bolt11.substring(0, 40)}...`,
  );

  // Alice navigates to invoice page (subscribes to websocket notifications)
  await alicePage.goto(`/invoice/${invoiceId}`);
  await alicePage.waitForURL(new RegExp(`/invoice/${invoiceId}`));

  // --- Bob: paste bolt11 into /send ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  await pasteAndSend(bobPage, bolt11);

  let bobUrl = bobPage.url();
  console.log(`[e2e] Bob navigated to: ${bobUrl}`);

  // Handle tip page if present (Alice may have tip prompt enabled)
  if (bobUrl.includes("/tip")) {
    console.log("[e2e] Tip page detected, clicking 'No' to skip tip...");
    const noTipButton = bobPage.locator("button", { hasText: "No" });
    await expect(noTipButton).toBeVisible({ timeout: 5_000 });
    await noTipButton.click();

    // After skipping tip, redirects to /invoice/{id} → then to /send/invoice/{id}
    await bobPage.waitForURL(
      (url) => !url.pathname.includes("/tip"),
      { timeout: 15_000 },
    );
    bobUrl = bobPage.url();
    console.log(`[e2e] After tip skip: ${bobUrl}`);
  }

  // Now Bob should be on /send/invoice/{id} or similar
  if (bobUrl.includes("/send/invoice/")) {
    // Internal path — amount is set on invoice, Send button should be visible
    const sendBtn = bobPage.locator('button[type="submit"]:visible');
    await expect(sendBtn).toBeVisible({ timeout: 5_000 });
    await sendBtn.click();
  } else if (bobUrl.includes("/send/lightning/")) {
    // External lightning path — amount is embedded, Send button visible
    const sendBtn = bobPage.locator('button[type="submit"]:visible');
    await expect(sendBtn).toBeVisible({ timeout: 5_000 });
    await sendBtn.click();
  } else if (bobUrl.includes("/invoice/")) {
    // On invoice view — navigate to send page
    const id = bobUrl.match(/\/invoice\/([^/?#]+)/)?.[1];
    if (id) {
      await bobPage.goto(`/send/invoice/${id}`);
      await bobPage.waitForURL(/\/send\/invoice\//);
    }
    const sendBtn = bobPage.locator('button[type="submit"]:visible');
    await expect(sendBtn).toBeVisible({ timeout: 5_000 });
    await sendBtn.click();
  }

  await waitForSentRedirect(bobPage, 30_000);
  console.log(`[e2e] Bob payment sent: ${bobPage.url()}`);

  // --- Verify Alice receives notification ---
  await waitForPaidRedirect(alicePage, invoiceId, 30_000);
  console.log(`[e2e] Alice redirected to: ${alicePage.url()}`);

  const successText = await alicePage
    .locator("h1")
    .first()
    .innerText({ timeout: 5_000 });
  expect(
    successText.toLowerCase().includes("payment") ||
      successText.toLowerCase().includes("success") ||
      successText.toLowerCase().includes("detected"),
    `Expected payment success text, got: ${successText}`,
  ).toBeTruthy();

  await aliceContext.close();
  await bobContext.close();
});
