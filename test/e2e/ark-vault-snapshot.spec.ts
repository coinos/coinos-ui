import { expect, test } from "@playwright/test";
import {
  bobUsername,
  bobPassword,
  testSecret,
  arkWalletPassword,
  login,
  ensureArkAccount,
  createArkInvoiceViaUI,
  sendArkFromTestEndpoint,
  waitForInvoicePaid,
} from "./helpers";

test("ark vault snapshot is cached in localStorage after receiving funds", async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(!testSecret, "E2E_TEST_SECRET is required for /test/ark/send");

  await login(page, bobUsername, bobPassword);
  await ensureArkAccount(page, arkWalletPassword);

  await page.goto(`/${bobUsername}`);
  await page.waitForLoadState("networkidle");

  const { invoiceId, address } = await createArkInvoiceViaUI(page, arkWalletPassword);
  console.log(`[e2e] Bob ark address: ${address}, invoice: ${invoiceId}`);

  await sendArkFromTestEndpoint(page, address, 100, invoiceId);

  const status = await waitForInvoicePaid(page, invoiceId, 100);
  expect(status.received).toBeGreaterThanOrEqual(100);

  // Poll localStorage for the snapshot (cacheVaultSnapshot is fire-and-forget)
  // Snapshot is keyed by user ID: arkVaultSnapshot:<uid>
  const snapshot = await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < localStorage.length; j++) {
        const k = localStorage.key(j)!;
        if (k.startsWith("arkVaultSnapshot")) {
          return JSON.parse(localStorage.getItem(k)!);
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
  expect(snapshot.arkInfoRaw.roundLifetime).toBeTruthy();
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
