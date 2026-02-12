import { expect, test } from "@playwright/test";

const username = process.env.E2E_USERNAME || "bob";
const password = process.env.E2E_PASSWORD || "pw";
const testSecret = process.env.E2E_TEST_SECRET;
const apiBaseUrl = process.env.E2E_API_BASE_URL || "http://localhost:3119";
const pauseAtEnd = process.env.E2E_PAUSE_AT_END === "true";

test("bob receives 1000 sats in ark vault after server wallet send", async ({
  page,
}) => {
  test.setTimeout(90_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for /test/ark/send");

  await page.goto("/login");
  await page.getByTestId("login-username").fill(username);
  await page.locator('input[name="password"]').first().fill(password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(new RegExp(`/${username}(?:[/?#]|$)`));

  const arkAccountCard = page.locator(
    '[data-testid="account-card"][data-account-type="ark"]',
  );
  const arkAccountCount = await arkAccountCard.count();
  expect(arkAccountCount).toBeGreaterThan(0);

  let invoiceOpened = false;

  const walletPassInput = page.getByTestId("walletpass-input");

  for (let i = 0; i < arkAccountCount; i++) {
    const card = arkAccountCard.nth(i);
    await card.scrollIntoViewIfNeeded();
    const accountHref = await card
      .locator('a[href^="/account/"]')
      .first()
      .getAttribute("href");
    const accountId = accountHref?.split("/account/")[1];

    await card.locator('a[href="/invoice"]').first().click();

    // Ark vault actions can require wallet password to derive/unlock key.
    if (
      await walletPassInput
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await walletPassInput.fill(password);
      await page.getByTestId("walletpass-submit").click();
    }

    invoiceOpened = await page
      .waitForURL(/\/invoice\/[^/?#]+/, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    // Fallback for brittle click bubbling in account cards:
    // set the selected aid cookie and navigate to invoice route directly.
    if (!invoiceOpened && accountId) {
      await page.evaluate((aid) => {
        document.cookie = `aid=${aid}; path=/; max-age=86400`;
      }, accountId);
      await page.goto("/invoice");
      invoiceOpened = await page
        .waitForURL(/\/invoice\/[^/?#]+/, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }

    if (invoiceOpened) break;

    if (
      await page
        .getByTestId("walletpass-cancel")
        .isVisible()
        .catch(() => false)
    ) {
      await page.getByTestId("walletpass-cancel").click();
    }
  }

  expect(invoiceOpened).toBeTruthy();
  await expect(page).toHaveURL(/\/invoice\/[^/?#]+/);

  const invoiceText = (
    await page.getByTestId("invoice-text").first().innerText()
  ).trim();
  const addressMatch = invoiceText.match(/t?ark1[a-z0-9]+/i);
  expect(addressMatch).toBeTruthy();
  const address = addressMatch![0];

  const invoiceId = page.url().split("/invoice/")[1]?.split(/[/?#]/)[0];
  expect(invoiceId).toBeTruthy();

  const sendResult = await page.evaluate(
    async ({ address, testSecret, invoiceId }) => {
      const res = await fetch("/test/ark/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-secret": testSecret,
        },
        body: JSON.stringify({ address, amount: 1000, iid: invoiceId }),
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    },
    { address, testSecret: testSecret!, invoiceId },
  );
  expect(
    sendResult.ok,
    `/test/ark/send failed (${sendResult.status}): ${sendResult.text}`,
  ).toBeTruthy();

  let paid = false;
  let status: any;

  for (let i = 0; i < 30; i++) {
    const statusResponse = await page.request.get(
      `${apiBaseUrl}/invoice/${invoiceId}`,
    );
    if (statusResponse.ok()) {
      status = await statusResponse.json();
      if ((status?.received || 0) >= 1000 || (status?.pending || 0) >= 1000) {
        paid = true;
        break;
      }
    }
    await page.waitForTimeout(1000);
  }

  expect(
    paid,
    `ark payment did not appear in invoice status: ${JSON.stringify(status)}`,
  ).toBeTruthy();

  const paidRouteReached = await page
    .waitForURL(new RegExp(`/invoice/${invoiceId}/paid(?:[/?#]|$)`), {
      timeout: 20_000,
    })
    .then(() => true)
    .catch(() => false);

  if (pauseAtEnd) {
    // Keep browser open for manual inspection at end of flow.
    await page.pause();
  }

  expect(
    paidRouteReached,
    `expected redirect to /invoice/${invoiceId}/paid, current URL: ${page.url()}`,
  ).toBeTruthy();

  console.log(
    `[e2e] ark invoice ${invoiceId} funded with 1000 sats (received=${status?.received || 0}, pending=${status?.pending || 0})`,
  );
});
