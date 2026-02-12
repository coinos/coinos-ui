import { chromium } from "playwright";

const BASE = "http://172.18.0.9:3000";
const API = "http://172.18.0.12:3119";
const API_KEY = "test-playwright-key";
const ARK_KEY =
  "1fed5c62c46ea3f72757e0baf1b83573ffd125eaba69a61c0f847c0d26d7b924";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on("console", (msg) =>
    console.log(`[browser:${msg.type()}]`, msg.text()),
  );
  page.on("pageerror", (err) => console.log("[page error]", err.message));

  // Monitor ALL arkade.computer requests
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("arkade.computer")) {
      console.log(
        `[req] ${req.method()} ${u} ${req.postData()?.substring(0, 300) || ""}`,
      );
    }
  });
  page.on("response", (resp) => {
    const u = resp.url();
    if (u.includes("arkade.computer") && !u.includes("subscription/")) {
      resp
        .text()
        .then((t) =>
          console.log(`[resp] ${resp.status()} ${u} -> ${t.substring(0, 500)}`),
        );
    }
  });

  // 1. Login
  console.log("--- Logging in ---");
  const loginResp = await page.request.post(`${API}/login`, {
    data: { username: "bob", password: "pw" },
    headers: { "content-type": "application/json", "x-api-key": API_KEY },
  });
  console.log("Login:", loginResp.status());
  const allHeaders = await loginResp.headersArray();
  for (const h of allHeaders) {
    if (h.name.toLowerCase() === "set-cookie") {
      const m = h.value.match(/token=([^;]+)/);
      if (m)
        await context.addCookies([
          { name: "token", value: m[1], domain: "172.18.0.9", path: "/" },
        ]);
    }
  }

  // 2. Go to bob's page, set arkkey
  await page.goto(`${BASE}/bob`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    (key) => localStorage.setItem("arkkey", JSON.stringify(key)),
    ARK_KEY,
  );

  // 3. Reload — don't wait for networkidle since SSE subscription stays open
  console.log("--- Reloading with arkkey ---");
  await page.goto(`${BASE}/bob`, { waitUntil: "domcontentloaded" });
  console.log("--- Waiting 15s for SDK ---");
  await page.waitForTimeout(15000);

  // 4. Check SDK state by evaluating in browser context
  console.log("\n--- Checking SDK balance/vtxos/history ---");
  // The app's getWallet() should have created a wallet instance.
  // We can't import the module directly, but we can check what the accounts endpoint returns.
  const accountsData = await page.request.get(`${API}/accounts`, {
    headers: {
      "x-api-key": API_KEY,
      cookie: (await context.cookies())
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
    },
  });
  console.log("Accounts:", (await accountsData.text()).substring(0, 500));

  // 5. Check server logs
  console.log("\n--- Done. Check docker logs app for arkSync entries ---");
  await browser.close();
})();
