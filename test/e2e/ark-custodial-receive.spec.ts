import { expect, test } from "@playwright/test";

const username = process.env.E2E_USERNAME || "bob";
const password = process.env.E2E_PASSWORD || "pw";
const testSecret = process.env.E2E_TEST_SECRET;
const apiBaseUrl = process.env.E2E_API_BASE_URL || "http://localhost:3119";
const pauseAtEnd = process.env.E2E_PAUSE_AT_END === "true";

test("custodial account receives ark payment via vault forward", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required");

  // 1. Log in
  await page.goto("/login");
  await page.getByTestId("login-username").fill(username);
  await page.locator('input[name="password"]').first().fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(new RegExp(`/${username}(?:[/?#]|$)`));

  // 2. Find custodial account and select it
  const custodialCard = page.locator(
    '[data-testid="account-card"]:not([data-account-type="ark"]):not([data-account-type="bitcoin"])',
  );
  const custodialCount = await custodialCard.count();
  expect(custodialCount).toBeGreaterThan(0);

  // Get the custodial account ID and switch to it
  const accountHref = await custodialCard
    .first()
    .locator('a[href^="/account/"]')
    .first()
    .getAttribute("href");
  const custodialAid = accountHref?.split("/account/")[1];
  expect(custodialAid).toBeTruthy();

  // Set custodial account as active
  await page.evaluate((aid) => {
    document.cookie = `aid=${aid}; path=/; max-age=86400`;
  }, custodialAid!);

  // 3. Handle wallet password if needed (to unlock ark vault)
  const walletPassInput = page.getByTestId("walletpass-input");

  // Navigate to invoice page to create an ark invoice
  await page.goto("/invoice");

  if (
    await walletPassInput
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false)
  ) {
    await walletPassInput.fill(password);
    await page.getByTestId("walletpass-submit").click();
  }

  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 10_000 });

  const invoiceId = page.url().split("/invoice/")[1]?.split(/[/?#]/)[0];
  expect(invoiceId).toBeTruthy();

  // 4. Switch invoice type to Ark
  // Click "More options" to open type picker
  const moreOptions = page.getByText("More options");
  if (await moreOptions.isVisible({ timeout: 3000 }).catch(() => false)) {
    await moreOptions.click();
  }

  // Click the Ark button
  const arkButton = page.locator("button", { hasText: "Ark" });
  await expect(arkButton).toBeVisible({ timeout: 5000 });
  await arkButton.click();

  // Wait for invoice to regenerate with ark type
  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 10_000 });

  const newInvoiceId = page.url().split("/invoice/")[1]?.split(/[/?#]/)[0];
  expect(newInvoiceId).toBeTruthy();

  // 5. Verify the invoice shows a tark address (vault's address)
  const invoiceText = (
    await page.getByTestId("invoice-text").first().innerText()
  ).trim();
  const addressMatch = invoiceText.match(/t?ark1[a-z0-9]+/i);
  expect(
    addressMatch,
    `Expected ark address in invoice text: ${invoiceText}`,
  ).toBeTruthy();
  const address = addressMatch![0];

  // Verify the invoice type is ark on the server
  const invoiceRes = await page.request.get(
    `${apiBaseUrl}/invoice/${newInvoiceId}`,
  );
  const invoiceData = await invoiceRes.json();
  expect(invoiceData.type).toBe("ark");
  expect(invoiceData.text).toContain("ark1");

  console.log(
    `[e2e] Created ark invoice ${newInvoiceId} on custodial account, address: ${address}`,
  );

  // 6. Send from server wallet to the vault address
  const sendResult = await page.evaluate(
    async ({ address, testSecret, iid }) => {
      const res = await fetch("/test/ark/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-secret": testSecret,
        },
        body: JSON.stringify({ address, amount: 1000 }),
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    },
    { address, testSecret: testSecret!, iid: newInvoiceId },
  );
  expect(
    sendResult.ok,
    `/test/ark/send failed (${sendResult.status}): ${sendResult.text}`,
  ).toBeTruthy();

  console.log(`[e2e] Sent 1000 sats to vault address ${address}`);

  // 7. Wait for the custodial forward to complete
  // The flow: vault receives -> arkSync detects custodial invoice ->
  // returns forward -> frontend sendArk to server -> POST /ark/receive -> credit
  let paid = false;
  let status: any;

  for (let i = 0; i < 60; i++) {
    const statusResponse = await page.request.get(
      `${apiBaseUrl}/invoice/${newInvoiceId}`,
    );
    if (statusResponse.ok()) {
      status = await statusResponse.json();
      if ((status?.received || 0) >= 1000) {
        paid = true;
        break;
      }
    }
    await page.waitForTimeout(2000);
  }

  expect(
    paid,
    `Custodial ark forward did not complete: ${JSON.stringify(status)}`,
  ).toBeTruthy();

  console.log(
    `[e2e] Custodial ark receive complete: invoice ${newInvoiceId} received=${status?.received}`,
  );

  if (pauseAtEnd) {
    await page.pause();
  }
});
