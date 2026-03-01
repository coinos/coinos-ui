import { expect, test } from "@playwright/test";
import { apiBaseUrl, bobUsername, bobPassword, login, lightningPay, waitForPageReady } from "./helpers";

test("redirects from /receive to /paid when lightning address payment arrives", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // --- Bob: log in and navigate to receive page ---
  await login(page, bobUsername, bobPassword);
  await page.goto(`/${bobUsername}/receive`);
  await waitForPageReady(page);
  // Wait for the receive page to settle and websocket to connect
  await page.waitForTimeout(3000);
  console.log(`[e2e] Bob on receive page: ${page.url()}`);

  // Ensure we're on the receive page (not redirected to an invoice)
  expect(page.url()).toContain(`/${bobUsername}/receive`);

  // --- External: create and pay LNURL invoice ---
  // Step 1: Fetch LNURL pay request
  const lnurlRes = await page.request.get(`${apiBaseUrl}/lnurlp/${bobUsername}`);
  const lnurlData = await lnurlRes.json();
  expect(lnurlData.callback).toBeTruthy();
  console.log(`[e2e] LNURL callback: ${lnurlData.callback}`);

  // Step 2: Call callback with 100 sat (100000 msat) to get bolt11
  const callbackUrl = lnurlData.callback.replace("https://dev.coinos.io/api", apiBaseUrl);
  const callbackRes = await page.request.get(`${callbackUrl}?amount=100000`);
  const callbackData = await callbackRes.json();
  const bolt11 = callbackData.pr;
  expect(bolt11).toBeTruthy();
  console.log(`[e2e] Got bolt11: ${bolt11.substring(0, 40)}...`);

  // Step 3: Pay from external lightning node
  console.log("[e2e] Paying from external lightning node (clb)...");
  const payResult = lightningPay(bolt11);
  console.log(`[e2e] Lightning pay result: ${payResult.substring(0, 100)}`);

  // --- Bob: should be redirected to /paid ---
  await page.waitForURL(/\/invoice\/[^/]+\/paid/, { timeout: 30_000 });
  console.log(`[e2e] Bob redirected to: ${page.url()}`);

  // Verify success UI is shown
  const heading = await page.locator("h1").first().innerText({ timeout: 5_000 });
  expect(
    heading.toLowerCase().includes("payment") || heading.toLowerCase().includes("success"),
    `Expected payment success/detected text, got: ${heading}`,
  ).toBeTruthy();

  if (process.env.E2E_PAUSE_AT_END === "true") await page.pause();
});
