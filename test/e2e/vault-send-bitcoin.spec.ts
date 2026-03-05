import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  loginNewContext,
  apiLogin,
  ensureVaultAccount,
  setActiveAccount,
  pasteAndSend,
} from "./helpers";

test("pasting vault bitcoin address redirects to /send/bitcoin, not /pay", async ({ browser }) => {
  test.setTimeout(60_000);

  // --- Alice: generate a vault invoice and grab the address ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  // Ensure vault account exists
  const aliceToken = await apiLogin(alicePage, aliceUsername, alicePassword);
  const vaultAccount = await ensureVaultAccount(alicePage, aliceToken, aliceUsername, alicePassword);
  await setActiveAccount(alicePage, vaultAccount.id);
  await alicePage.goto(`/${aliceUsername}`);

  // Find the bitcoin vault account card and click Receive
  const vaultCard = alicePage.locator('[data-testid="account-card"][data-account-type="bitcoin"]');
  await expect(vaultCard.first()).toBeVisible({ timeout: 10_000 });

  const receiveBtn = vaultCard.first().getByTestId("account-receive");
  await receiveBtn.click({ force: true });

  // Wait for the invoice page
  await alicePage.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });

  // Grab the bitcoin address from the invoice text
  const invoiceText = await alicePage.getByTestId("invoice-text").first().innerText();
  const vaultAddress = invoiceText.trim().replace(/\s+/g, "");
  expect(
    vaultAddress.startsWith("bcrt1") || vaultAddress.startsWith("bc1"),
    `Expected bitcoin address, got: ${vaultAddress}`,
  ).toBeTruthy();

  console.log(`[e2e] Alice vault address: ${vaultAddress}`);
  await aliceContext.close();

  // --- Bob: paste the vault address and verify redirect ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  // Paste Alice's vault address
  await pasteAndSend(bobPage, vaultAddress);

  const finalUrl = bobPage.url();
  console.log(`[e2e] After paste, Bob navigated to: ${finalUrl}`);

  // Should go to /send/bitcoin, NOT /pay/alice
  expect(finalUrl, `Expected /send/bitcoin/ URL but got: ${finalUrl}`).toContain("/send/bitcoin/");
  expect(finalUrl, `Should NOT redirect to /pay/ but got: ${finalUrl}`).not.toContain("/pay/");

  await bobContext.close();
});
