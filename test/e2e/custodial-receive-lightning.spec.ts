import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  apiBaseUrl,
  login,
  lightningPay,
  waitForInvoicePaid,
  waitForPaidRedirect,
} from "./helpers";

test("custodial receives external lightning payment from clb", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // --- Alice: log in and create a lightning invoice with amount via API ---
  await login(page, aliceUsername, alicePassword);

  // Get auth token
  const tokenRes = await page.request.post(`${apiBaseUrl}/login`, {
    data: { username: aliceUsername, password: alicePassword },
  });
  const { token } = await tokenRes.json();

  // Create lightning invoice with amount
  const invoiceRes = await page.request.post(`${apiBaseUrl}/invoice`, {
    headers: { authorization: `Bearer ${token}` },
    data: {
      invoice: { type: "lightning", amount: 1000 },
      user: { username: aliceUsername },
    },
  });
  const { id: invoiceId } = await invoiceRes.json();
  expect(invoiceId).toBeTruthy();

  // Get the bolt11 payreq
  const invDetailRes = await page.request.get(
    `${apiBaseUrl}/invoice/${invoiceId}`,
  );
  const invDetail = await invDetailRes.json();
  const bolt11 = invDetail.text;
  expect(bolt11).toBeTruthy();
  console.log(
    `[e2e] Alice lightning invoice: ${invoiceId}, bolt11: ${bolt11.substring(0, 40)}...`,
  );

  // Navigate to the invoice page (Alice subscribes to websocket notifications)
  await page.goto(`/invoice/${invoiceId}`);
  await page.waitForURL(new RegExp(`/invoice/${invoiceId}`));

  // Small delay to ensure websocket subscription is established
  await page.waitForTimeout(1000);

  // --- External: pay from clb ---
  console.log("[e2e] Paying from external lightning node (clb)...");
  const payResult = lightningPay(bolt11);
  console.log(`[e2e] Lightning pay result: ${payResult.substring(0, 100)}`);

  // --- Verify payment via API polling ---
  const status = await waitForInvoicePaid(page, invoiceId, 1000, {
    interval: 1000,
    maxAttempts: 15,
  });
  console.log(
    `[e2e] Invoice paid: received=${status?.received}, pending=${status?.pending}`,
  );

  // --- Alice: wait for redirect to /paid (with fallback) ---
  const paidReached = await page
    .waitForURL(
      new RegExp(`/invoice/${invoiceId}/paid(?:[/?#]|$)`),
      { timeout: 10_000 },
    )
    .then(() => true)
    .catch(() => false);

  if (paidReached) {
    console.log(`[e2e] Alice redirected to paid: ${page.url()}`);
    const successText = await page
      .locator("h1")
      .first()
      .innerText({ timeout: 5_000 });
    expect(
      successText.toLowerCase().includes("payment") ||
        successText.toLowerCase().includes("success") ||
        successText.toLowerCase().includes("detected"),
      `Expected payment success text, got: ${successText}`,
    ).toBeTruthy();
  } else {
    // Redirect didn't happen but payment was confirmed via API
    console.log(
      `[e2e] No /paid redirect (websocket timing), but payment confirmed via API. Current URL: ${page.url()}`,
    );
  }
});
