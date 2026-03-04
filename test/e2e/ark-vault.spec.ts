import { expect, test } from "@playwright/test";
import {
  aliceUsername,
  alicePassword,
  bobUsername,
  bobPassword,
  testSecret,
  arkWalletPassword,
  apiBaseUrl,
  login,
  loginNewContext,
  ensureArkAccount,
  createArkInvoiceViaUI,
  sendArkFromTestEndpoint,
  waitForInvoicePaid,
  fillNumpadAmount,
  waitForSendComplete,
  waitForDashboard,
  waitForArkSync,
  dockerExec,
} from "./helpers";

// All ark tests share the server wallet and must run serially
test.describe.serial("ark vault tests", () => {
  test("bob receives 100 sats in ark vault after server wallet send", async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required for /test/ark/send");

    await login(page, bobUsername, bobPassword);
    await ensureArkAccount(page, arkWalletPassword);

    await page.goto(`/${bobUsername}`);
    await waitForDashboard(page);

    const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
    console.log(`[e2e] Bob ark address: ${address}, invoice: ${invoiceId}`);

    await sendArkFromTestEndpoint(page, address, 100, invoiceId);

    const status = await waitForInvoicePaid(page, invoiceId, 100);
    expect(status.received).toBeGreaterThanOrEqual(100);

    console.log(
      `[e2e] ark invoice ${invoiceId} funded with 100 sats (received=${status?.received || 0})`,
    );
  });

  test("vault snapshot is cached after receiving funds", async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required for /test/ark/send");

    await login(page, bobUsername, bobPassword);
    await ensureArkAccount(page, arkWalletPassword);

    await page.goto(`/${bobUsername}`);
    await waitForDashboard(page);

    const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
    console.log(`[e2e] Bob ark address: ${address}, invoice: ${invoiceId}`);

    await sendArkFromTestEndpoint(page, address, 100, invoiceId);

    const status = await waitForInvoicePaid(page, invoiceId, 100);
    expect(status.received).toBeGreaterThanOrEqual(100);

    // Navigate to dashboard to trigger arkSync which calls cacheVaultSnapshot
    await page.goto(`/${bobUsername}`);
    await waitForDashboard(page);
    await page.waitForTimeout(5_000);

    // Poll localStorage for the snapshot
    const snapshot = await page.evaluate(async () => {
      for (let i = 0; i < 30; i++) {
        for (let j = 0; j < localStorage.length; j++) {
          const k = localStorage.key(j)!;
          if (k.startsWith("arkVaultSnapshot")) {
            const snap = JSON.parse(localStorage.getItem(k)!);
            if (snap?.vtxos?.length > 0) return snap;
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      return null;
    });

    expect(snapshot, "Snapshot should exist in localStorage").toBeTruthy();
    expect(snapshot.version).toBe(1);
    expect(snapshot.arkServerUrl).toBeTruthy();
    expect(snapshot.arkInfoRaw).toBeTruthy();
    expect(Object.keys(snapshot.arkInfoRaw).length).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.vtxos)).toBe(true);
    expect(snapshot.vtxos.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.vtxoChains).toBeTruthy();
    expect(typeof snapshot.vtxoChains).toBe("object");
    expect(snapshot.virtualTxs).toBeTruthy();
    expect(typeof snapshot.virtualTxs).toBe("object");

    console.log(
      `[e2e] Snapshot cached: ${snapshot.vtxos.length} vtxos, ${Object.keys(snapshot.vtxoChains).length} chains, ${Object.keys(snapshot.virtualTxs).length} virtualTxs`,
    );
  });

  test("custodial account receives ark payment via vault forward", async ({ page }) => {
    test.setTimeout(120_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required");

    await login(page, bobUsername, bobPassword);
    await ensureArkAccount(page, arkWalletPassword);

    await page.goto(`/${bobUsername}`);
    await waitForDashboard(page);

    const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
    console.log(`[e2e] Created ark invoice ${invoiceId}, address: ${address}`);

    await page.goto(`/invoice/${invoiceId}`);
    await page.waitForURL(new RegExp(`/invoice/${invoiceId}`));

    await sendArkFromTestEndpoint(page, address, 1000, invoiceId);
    console.log(`[e2e] Sent 1000 sats to vault address`);

    // Wait for custodial forward: vault receives → arkSync detects → client forwards
    let paid = false;
    let status: any;
    for (let i = 0; i < 60; i++) {
      const res = await page.request.get(`${apiBaseUrl}/invoice/${invoiceId}`);
      if (res.ok()) {
        status = await res.json();
        if ((status?.received || 0) >= 1000) {
          paid = true;
          break;
        }
      }
      await page.waitForTimeout(2000);
    }
    expect(paid, `Custodial ark forward did not complete: ${JSON.stringify(status)}`).toBeTruthy();
    console.log(`[e2e] Custodial ark receive complete: received=${status?.received}`);
  });

  test("vault sends to own custodial account", async ({ page }) => {
    test.slow();
    test.setTimeout(180_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

    await login(page, bobUsername, bobPassword);
    await ensureArkAccount(page, arkWalletPassword);

    await page.goto(`/${bobUsername}`);
    await waitForDashboard(page);

    const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
    console.log(`[e2e] Bob vault address: ${address}, invoice: ${invoiceId}`);

    const fundAmount = 5000;
    await sendArkFromTestEndpoint(page, address, fundAmount, invoiceId);
    await waitForInvoicePaid(page, invoiceId, fundAmount);
    console.log(`[e2e] Vault funded with ${fundAmount} sats`);

    await waitForArkSync(page, bobUsername);

    const balance = await page.evaluate(async () => {
      const { getBalance } = await import("/src/lib/ark.ts");
      return await getBalance();
    });
    console.log(`[e2e] Vault balance: ${JSON.stringify(balance)}`);
    expect(balance.available + balance.preconfirmed).toBeGreaterThanOrEqual(fundAmount);

    const accountsRes = await page.request.get(`${apiBaseUrl}/accounts`);
    const accounts = await accountsRes.json();
    const arkAccount = accounts.find((a: any) => a.type === "ark");
    expect(arkAccount, "Ark account should exist").toBeTruthy();

    const accountRes = await page.request.get(`${apiBaseUrl}/account/${arkAccount.id}`);
    const accountInfo = await accountRes.json();
    const serverArkAddress = accountInfo.arkAddress;

    const sendAmount = 1000;
    const txid = await page.evaluate(
      async ({ serverArkAddress, amount }) => {
        const { sendArk } = await import("/src/lib/ark.ts");
        return await sendArk(serverArkAddress, amount);
      },
      { serverArkAddress, amount: sendAmount },
    );
    console.log(`[e2e] Ark send txid: ${txid}`);
    expect(txid).toBeTruthy();

    const frontendBase = "http://127.0.0.1:4173";
    const vaultSendRes = await page.request.post(`${frontendBase}/api/ark/vault-send`, {
      data: { hash: txid, amount: sendAmount, aid: arkAccount.id },
    });
    expect(vaultSendRes.ok(), `vault-send: ${await vaultSendRes.text()}`).toBeTruthy();

    const invoiceRes = await page.request.post(`${frontendBase}/api/invoice`, {
      data: { invoice: { type: "ark", amount: sendAmount, aid: arkAccount.id } },
    });
    expect(invoiceRes.ok(), `invoice: ${await invoiceRes.text()}`).toBeTruthy();
    const inv = await invoiceRes.json();

    const receiveRes = await page.request.post(`${frontendBase}/api/ark/receive`, {
      data: { amount: sendAmount, hash: txid, iid: inv.id },
    });
    expect(receiveRes.ok(), `receive: ${await receiveRes.text()}`).toBeTruthy();
    const payment = await receiveRes.json();
    console.log(`[e2e] Vault→custodial payment complete, id: ${payment.id}`);
    expect(payment.id).toBeTruthy();
  });

  test("vault sends to external Liquid address via forward", async ({ page }) => {
    test.slow();
    test.setTimeout(180_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

    await login(page, aliceUsername, alicePassword);
    await ensureArkAccount(page, arkWalletPassword);

    await page.goto(`/${aliceUsername}`);
    await waitForDashboard(page);

    const { invoiceId, address: arkAddress } = await createArkInvoiceViaUI(
      page,
      arkWalletPassword,
    );
    console.log(`[e2e] Alice vault address: ${arkAddress}, invoice: ${invoiceId}`);

    const fundAmount = 2000;
    await sendArkFromTestEndpoint(page, arkAddress, fundAmount, invoiceId);
    await waitForInvoicePaid(page, invoiceId, fundAmount);
    console.log(`[e2e] Vault funded with ${fundAmount} sats`);

    await waitForArkSync(page, aliceUsername);

    const balance = await page.evaluate(async () => {
      const { getBalance } = await import("/src/lib/ark.ts");
      return await getBalance();
    });
    console.log(`[e2e] Vault balance: ${JSON.stringify(balance)}`);
    expect(balance.available + balance.preconfirmed).toBeGreaterThanOrEqual(fundAmount);

    const accountsRes = await page.request.get(`${apiBaseUrl}/accounts`);
    const accounts = await accountsRes.json();
    const arkAccount = accounts.find((a: any) => a.type === "ark");
    expect(arkAccount).toBeTruthy();

    const accountRes = await page.request.get(`${apiBaseUrl}/account/${arkAccount.id}`);
    const accountInfo = await accountRes.json();
    const serverArkAddress = accountInfo.arkAddress;

    const liquidAddress = dockerExec("lq", "elements-cli getnewaddress");
    console.log(`[e2e] External Liquid address: ${liquidAddress}`);

    const sendAmount = 1000;
    const txid = await page.evaluate(
      async ({ serverArkAddress, amount }) => {
        const { sendArk } = await import("/src/lib/ark.ts");
        return await sendArk(serverArkAddress, amount);
      },
      { serverArkAddress, amount: sendAmount },
    );
    console.log(`[e2e] Ark send txid: ${txid}`);
    expect(txid).toBeTruthy();

    const frontendBase = "http://127.0.0.1:4173";
    const vaultSendRes = await page.request.post(`${frontendBase}/api/ark/vault-send`, {
      data: { hash: txid, amount: sendAmount, aid: arkAccount.id },
    });
    expect(vaultSendRes.ok(), `vault-send: ${await vaultSendRes.text()}`).toBeTruthy();

    const invoiceRes = await page.request.post(`${frontendBase}/api/invoice`, {
      data: {
        invoice: { type: "ark", amount: sendAmount, aid: arkAccount.id, forward: liquidAddress },
      },
    });
    expect(invoiceRes.ok(), `invoice: ${await invoiceRes.text()}`).toBeTruthy();
    const inv = await invoiceRes.json();

    const receiveRes = await page.request.post(`${frontendBase}/api/ark/receive`, {
      data: { amount: sendAmount, hash: txid, iid: inv.id },
    });
    expect(receiveRes.ok(), `receive: ${await receiveRes.text()}`).toBeTruthy();
    const payment = await receiveRes.json();
    console.log(`[e2e] Vault→Liquid forward payment complete, id: ${payment.id}`);
    expect(payment.id).toBeTruthy();
  });

  test("custodial sends to external ark address", async ({ browser }) => {
    test.setTimeout(120_000);
    test.skip(!testSecret, "E2E_TEST_SECRET is required for ark tests");

    // Alice: get her ark vault address
    const { context: aliceContext, page: alicePage } = await loginNewContext(
      browser,
      aliceUsername,
      alicePassword,
    );
    await ensureArkAccount(alicePage, arkWalletPassword);
    await alicePage.goto(`/${aliceUsername}`);
    await waitForDashboard(alicePage);

    const { address: arkAddress } = await createArkInvoiceViaUI(alicePage, arkWalletPassword);
    console.log(`[e2e] Alice ark address: ${arkAddress}`);
    await aliceContext.close();

    // Bob: send to alice's ark address from custodial
    const { context: bobContext, page: bobPage } = await loginNewContext(
      browser,
      bobUsername,
      bobPassword,
    );

    await bobPage.goto(`/send/ark/${arkAddress}`);
    await bobPage.waitForLoadState("domcontentloaded");
    console.log(`[e2e] Bob navigated to: ${bobPage.url()}`);

    await fillNumpadAmount(bobPage, 100);
    await bobPage.waitForURL(/\/send\/ark\/[^/]+\/\d+/, { timeout: 10_000 });
    console.log(`[e2e] Bob on ark send confirmation: ${bobPage.url()}`);

    const sendButton = bobPage.locator('button[type="submit"]');
    await expect(sendButton).toBeVisible({ timeout: 5_000 });
    await sendButton.click();

    try {
      await waitForSendComplete(bobPage, 60_000);
    } catch (e: any) {
      if (/VTXO_RECOVERABLE|insufficient funds|not enough liquidity/i.test(e.message)) {
        test.skip(true, `Ark server has no liquidity: ${e.message}`);
      }
      throw e;
    }
    console.log(`[e2e] Bob ark payment sent: ${bobPage.url()}`);
    await bobContext.close();
  });
});
