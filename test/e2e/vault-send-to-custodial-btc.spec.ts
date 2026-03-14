import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  apiBaseUrl,
  loginNewContext,
  apiLogin,
  ensureVaultAccount,
  setActiveAccount,
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

  const token = await apiLogin(bobPage, bobUsername, bobPassword);

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

  // --- Alice: ensure vault account and paste Bob's custodial address ---
  const { context: aliceContext, page: alicePage } = await loginNewContext(
    browser,
    aliceUsername,
    alicePassword,
  );

  const aliceToken = await apiLogin(alicePage, aliceUsername, alicePassword);
  const vaultAccount = await ensureVaultAccount(alicePage, aliceToken, aliceUsername, alicePassword);
  await setActiveAccount(alicePage, vaultAccount.id);
  console.log(`[e2e] Alice switched to vault account: ${vaultAccount.id}`);

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
