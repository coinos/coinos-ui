import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  apiBaseUrl,
  login,
  loginNewContext,
  setActiveAccount,
  createBitcoinInvoiceViaUI,
  pasteAndSend,
} from "./helpers";

test("vault sending to custodial bitcoin address stays on /send/bitcoin, not /send/invoice", async ({
  browser,
}) => {
  test.setTimeout(60_000);

  // --- Bob: create a custodial bitcoin invoice to get his address ---
  const { context: bobContext, page: bobPage } = await loginNewContext(
    browser,
    bobUsername,
    bobPassword,
  );

  const tokenRes = await bobPage.request.post(`${apiBaseUrl}/login`, {
    data: { username: bobUsername, password: bobPassword },
  });
  const { token } = await tokenRes.json();

  const invoiceRes = await bobPage.request.post(`${apiBaseUrl}/invoice`, {
    headers: { authorization: `Bearer ${token}` },
    data: {
      invoice: { type: "bitcoin" },
      user: { username: bobUsername },
    },
  });
  const { id: invoiceId } = await invoiceRes.json();
  expect(invoiceId).toBeTruthy();

  const invDetail = await (await bobPage.request.get(`${apiBaseUrl}/invoice/${invoiceId}`)).json();
  const custodialAddress = invDetail.text;
  expect(custodialAddress).toBeTruthy();
  console.log(`[e2e] Bob custodial bitcoin address: ${custodialAddress}`);
  await bobContext.close();

  // --- Alice: switch to vault account and paste Bob's custodial address ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  // Find the bitcoin vault account and switch to it
  const vaultCard = alicePage.locator('[data-testid="account-card"][data-account-type="bitcoin"]');
  const vaultCount = await vaultCard.count();
  if (vaultCount === 0) {
    test.skip(true, "No bitcoin vault account found");
    await aliceContext.close();
    return;
  }

  const accountHref = await vaultCard
    .first()
    .locator('a[href^="/account/"]')
    .first()
    .getAttribute("href");
  const vaultAid = accountHref?.split("/account/")[1];
  expect(vaultAid).toBeTruthy();

  await setActiveAccount(alicePage, vaultAid!);
  console.log(`[e2e] Alice switched to vault account: ${vaultAid}`);

  // Paste Bob's custodial bitcoin address
  await pasteAndSend(alicePage, custodialAddress);

  const finalUrl = alicePage.url();
  console.log(`[e2e] After paste, Alice navigated to: ${finalUrl}`);

  // Should stay on /send/bitcoin (on-chain), NOT redirect to /send/invoice (internal)
  expect(finalUrl, `Expected /send/bitcoin/ URL but got: ${finalUrl}`).toContain("/send/bitcoin/");
  expect(finalUrl, `Should NOT redirect to /send/invoice/ but got: ${finalUrl}`).not.toContain(
    "/send/invoice/",
  );

  await aliceContext.close();
});
