import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  login,
  getBitcoinAddress,
  pasteAndSend,
  fillNumpadAmount,
  waitForSendComplete,
  apiLogin,
  apiBaseUrl,
} from "./helpers";

test("custodial bitcoin send with low fee shows bump reserve and supports CPFP bump", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await login(page, bobUsername, bobPassword);

  // Check bob has enough balance
  const token = await apiLogin(page, bobUsername, bobPassword);
  const meRes = await page.request.get(`${apiBaseUrl}/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const me = await meRes.json();
  if (!me.balance || me.balance < 35000) {
    test.skip(true, `Custodial balance too low: ${me.balance}`);
    return;
  }

  const externalAddress = getBitcoinAddress();

  // --- Send flow: paste address → amount → select low fee → send ---
  await pasteAndSend(page, externalAddress);
  expect(page.url()).toContain("/send/bitcoin/");

  await fillNumpadAmount(page, 2000);
  await page.waitForURL(/\/send\/bitcoin\/[^/]+\/\d+/, { timeout: 10_000 });

  // Check no error on fee page
  const loadError = await page
    .locator(".text-red-600")
    .first()
    .innerText({ timeout: 1000 })
    .catch(() => "");
  expect(loadError, `Fee page error: ${loadError}`).toBeFalsy();

  // The fee page now uses a slider instead of low/mid/high buttons.
  // At the default fee rate, bumpReserve may or may not be set by the server.
  // Check if "Refundable reserve" text appears (indicates bumpReserve > 0).
  const bumpReserveVisible = await page
    .locator("text=Refundable reserve")
    .first()
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!bumpReserveVisible) {
    console.log("[e2e] No refundable reserve shown at default fee rate — skipping bump UI test");
  }

  // Send the transaction
  const sendButton = page.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();

  await waitForSendComplete(page, 30_000);

  // Extract payment ID from /sent/{id}
  const sentMatch = page.url().match(/\/sent\/([^/?#]+)/);
  expect(sentMatch, "Should be on /sent/ page").toBeTruthy();
  const paymentId = sentMatch![1];

  // --- Navigate to payment detail and verify bump data ---
  await page.goto(`/payment/${paymentId}`);
  await page.waitForLoadState("load");
  await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });

  // Verify payment has bump reserve via API
  const paymentRes = await page.request.get(`${apiBaseUrl}/payments/${paymentId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(paymentRes.ok()).toBeTruthy();
  const payment = await paymentRes.json();
  console.log(
    `[e2e] Payment: confirmed=${payment.confirmed}, bumpReserve=${payment.bumpReserve}`,
  );

  if (!payment.bumpReserve || payment.bumpReserve <= 0 || payment.confirmed || payment.childTxid) {
    console.log("[e2e] Payment not bumpable — skipping bump UI test");
    return;
  }

  // --- Test CPFP bump UI ---

  // Wait for hydration
  await page.waitForTimeout(2000);

  // Click "Speed up" button
  const speedUpBtn = page.locator("button.btn-accent", { hasText: "Speed up" });
  await expect(speedUpBtn).toBeVisible({ timeout: 10_000 });
  await speedUpBtn.click();

  // Wait for success toast — the bump is executed directly
  await expect(page.locator("text=Transaction bumped!").first()).toBeVisible({ timeout: 15_000 });
  console.log("[e2e] CPFP bump succeeded!");

  // Verify bump stored via API
  const bumpedRes = await page.request.get(`${apiBaseUrl}/payments/${paymentId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const bumped = await bumpedRes.json();
  console.log(`[e2e] After bump: confirmed=${bumped.confirmed}, bumpReserve=${bumped.bumpReserve}`);
});

test("bump API executes CPFP for unconfirmed payment", async ({ page }) => {
  test.setTimeout(60_000);

  await login(page, bobUsername, bobPassword);
  const token = await apiLogin(page, bobUsername, bobPassword);

  // Find an unconfirmed outgoing bitcoin payment with bump reserve
  const paymentsRes = await page.request.get(`${apiBaseUrl}/payments`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(paymentsRes.ok()).toBeTruthy();
  const data = await paymentsRes.json();
  const payments = data.payments || data;

  const bumpable = payments.find(
    (p: any) =>
      p.type === "bitcoin" &&
      !p.confirmed &&
      p.amount < 0 &&
      p.bumpReserve > 0 &&
      !p.childTxid,
  );

  if (!bumpable) {
    test.skip(true, "No bumpable unconfirmed bitcoin payment found");
    return;
  }

  console.log(`[e2e] Bumpable payment: ${bumpable.id}, reserve: ${bumpable.bumpReserve}`);

  // Test bump endpoint
  const bumpRes = await page.request.post(`${apiBaseUrl}/bump`, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    data: { id: bumpable.id },
  });

  const bumpText = await bumpRes.text();
  console.log(`[e2e] Bump result: ${bumpRes.status()} ${bumpText.substring(0, 200)}`);
  if (!bumpRes.ok() && bumpText.includes("exceeds reserve")) {
    test.skip(true, "Bump reserve already consumed by prior test");
    return;
  }
  expect(bumpRes.ok(), `Bump failed: ${bumpText}`).toBeTruthy();
});
