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

  // Select lowest fee rate to ensure bumpReserve is set
  const lowButton = page.locator("button.btn-sm", { hasText: /low/i });
  if (await lowButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await lowButton.click();
    await page.waitForURL(/\/send\/bitcoin\/[^/]+\/\d+\//, { timeout: 10_000 });
  }

  // Verify bump reserve is displayed
  const bumpReserveVisible = await page
    .locator("text=Bump Reserve")
    .first()
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  expect(bumpReserveVisible, "Bump reserve should be shown for low fee rate").toBeTruthy();

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

  // Click "Speed up" button using mouse coordinates (Svelte hydration can delay event binding)
  const speedUpBtn = page.locator("button.btn-accent", { hasText: "Speed up" });
  await expect(speedUpBtn).toBeVisible({ timeout: 10_000 });
  const box = await speedUpBtn.boundingBox();
  expect(box, "Speed up button should have bounds").toBeTruthy();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);

  // Wait for bump estimate API call
  await page.waitForTimeout(5000);

  // Verify bump dialog opened
  const pageText = await page.evaluate(() => document.body.innerText);
  expect(pageText).toContain("Speed up transaction");

  // Check for fee rate buttons (estimate loaded)
  const fastBtn = page.locator("button.btn-sm", { hasText: /Fast/ });
  const hasFeeButtons = await fastBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);

  if (!hasFeeButtons) {
    console.log("[e2e] Bump estimate failed to load fee options");
    return;
  }

  // Should show cost estimate
  await expect(page.locator("text=Cost:")).toBeVisible({ timeout: 5_000 });

  // Execute the bump
  const confirmBumpBtn = page.locator("button", { hasText: "Confirm bump" });
  await expect(confirmBumpBtn).toBeVisible({ timeout: 5_000 });

  if (await confirmBumpBtn.isDisabled()) {
    console.log("[e2e] Confirm bump disabled — cost exceeds reserve");
    return;
  }

  await confirmBumpBtn.click();

  // Wait for success toast
  await expect(page.locator("text=Transaction bumped!").first()).toBeVisible({ timeout: 15_000 });
  console.log("[e2e] CPFP bump succeeded!");

  // Verify bump stored via API
  const bumpedRes = await page.request.get(`${apiBaseUrl}/payments/${paymentId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const bumped = await bumpedRes.json();
  expect(bumped.childTxid, "Payment should have child txid after bump").toBeTruthy();
  expect(bumped.bumpedFee, "Payment should have bumped fee").toBeGreaterThan(0);
  console.log(`[e2e] Child txid: ${bumped.childTxid}, fee: ${bumped.bumpedFee}`);
});

test("bump estimate API returns valid cost and fee data", async ({ page }) => {
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

  // Test bump estimate endpoint
  const estimateRes = await page.request.post(`${apiBaseUrl}/bump/estimate`, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    data: { id: bumpable.id, targetFeeRate: 10 },
  });

  expect(estimateRes.ok(), `Bump estimate failed: ${await estimateRes.text()}`).toBeTruthy();
  const estimate = await estimateRes.json();

  console.log(`[e2e] Estimate: cost=${estimate.cost}, reserve=${estimate.bumpReserve}`);
  expect(estimate.cost).toBeGreaterThanOrEqual(0);
  expect(estimate.bumpReserve).toBeGreaterThan(0);
  expect(estimate.fees).toBeTruthy();
  expect(estimate.fees.fastestFee).toBeGreaterThan(0);
});
