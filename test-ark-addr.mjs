import { chromium } from "playwright";

const BASE = "http://172.18.0.9:3000";
const ARK_KEY = "1fed5c62c46ea3f72757e0baf1b83573ffd125eaba69a61c0f847c0d26d7b924";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async (key) => {
    try {
      const sdk = await import("/_app/immutable/chunks/Ciyv5OgZ.js");
      const { SingleKey, Wallet } = sdk;

      const identity = SingleKey.fromHex(key);
      const wallet = await Wallet.create({
        identity,
        arkServerUrl: "https://arkade.computer",
      });
      const address = await wallet.getAddress();
      const balance = await wallet.getBalance();
      const vtxos = await wallet.getVtxos({ spendableOnly: false });
      const history = await wallet.getTransactionHistory();
      return {
        address,
        balance,
        vtxoCount: vtxos.length,
        vtxos: vtxos.map(v => ({
          txid: v.txid, value: Number(v.value), state: v.virtualStatus?.state,
        })),
        historyCount: history.length,
      };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  }, ARK_KEY);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
