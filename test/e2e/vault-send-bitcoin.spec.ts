import { expect, test } from "@playwright/test";

const aliceUsername = process.env.E2E_ALICE_USERNAME || "alice";
const alicePassword = process.env.E2E_ALICE_PASSWORD || "pw";
const bobUsername = process.env.E2E_BOB_USERNAME || "bob";
const bobPassword = process.env.E2E_BOB_PASSWORD || "pw";

test("pasting vault bitcoin address redirects to /send/bitcoin, not /pay", async ({
  browser,
}) => {
  test.setTimeout(60_000);

  // --- Alice: generate a vault invoice and grab the address ---
  const aliceContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();

  await alicePage.goto("/login");
  await alicePage.getByTestId("login-username").fill(aliceUsername);
  await alicePage.locator('input[name="password"]').first().fill(alicePassword);
  await alicePage.getByTestId("login-submit").click();
  await expect(alicePage).toHaveURL(
    new RegExp(`/${aliceUsername}(?:[/?#]|$)`),
  );

  // Find the bitcoin vault account card and click Receive
  const vaultCard = alicePage.locator(
    '[data-testid="account-card"][data-account-type="bitcoin"]',
  );
  await expect(vaultCard.first()).toBeVisible({ timeout: 10_000 });

  const receiveBtn = vaultCard
    .first()
    .getByTestId("account-receive");
  await receiveBtn.click();

  // Wait for the invoice page
  await alicePage.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 10_000 });

  // Grab the bitcoin address from the invoice text
  const invoiceText = await alicePage
    .getByTestId("invoice-text")
    .first()
    .innerText();
  const vaultAddress = invoiceText.trim().replace(/\s+/g, "");
  expect(
    vaultAddress.startsWith("bcrt1") || vaultAddress.startsWith("bc1"),
    `Expected bitcoin address, got: ${vaultAddress}`,
  ).toBeTruthy();

  console.log(`[e2e] Alice vault address: ${vaultAddress}`);
  await aliceContext.close();

  // --- Bob: paste the vault address and verify redirect ---
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  await bobPage.goto("/login");
  await bobPage.waitForLoadState("networkidle");
  await bobPage.getByTestId("login-username").fill(bobUsername);
  await bobPage.locator('input[name="password"]').first().fill(bobPassword);
  await bobPage.getByTestId("login-submit").click();
  await expect(bobPage).toHaveURL(new RegExp(`/${bobUsername}(?:[/?#]|$)`), {
    timeout: 15_000,
  });

  // Navigate to send page
  await bobPage.goto("/send");
  await bobPage.waitForURL(/\/send/);

  // Fill the textarea with Alice's vault address and submit
  const textarea = bobPage.locator('textarea[name="text"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });
  await textarea.fill(vaultAddress);

  // Click the submit button and wait for navigation away from /send
  await bobPage.locator('button[type="submit"]').first().click();

  // Wait for navigation to leave /send (goes to /send/bitcoin, /pay, or /invoice)
  await bobPage.waitForURL(
    (url) => url.pathname !== "/send" && url.pathname !== "/send/",
    { timeout: 15_000 },
  );

  const finalUrl = bobPage.url();
  console.log(`[e2e] After paste, Bob navigated to: ${finalUrl}`);

  // Should go to /send/bitcoin, NOT /pay/alice
  expect(
    finalUrl,
    `Expected /send/bitcoin/ URL but got: ${finalUrl}`,
  ).toContain("/send/bitcoin/");
  expect(
    finalUrl,
    `Should NOT redirect to /pay/ but got: ${finalUrl}`,
  ).not.toContain("/pay/");

  await bobContext.close();
});
