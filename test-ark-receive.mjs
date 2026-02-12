import { chromium } from "playwright";

const BASE = "http://172.18.0.9:3000";
const API = "http://172.18.0.12:3119";
const API_KEY = "test-playwright-key";
const ARK_KEY = "02b3ef049246a14b8a31e66f877dcb32be34945f270054ad97534af8e5ff75f0";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
  page.on("pageerror", (err) => console.log("[page error]", err.message));

  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("ark") || u.includes("indexer") || u.includes("sync")) {
      console.log(`[req] ${req.method()} ${u} ${req.postData()?.substring(0, 500) || ""}`);
    }
  });
  page.on("response", (resp) => {
    const u = resp.url();
    if (
      (u.includes("ark") && !u.includes("__data") && !u.includes(".png")) ||
      u.includes("indexer") ||
      u.includes("sync")
    ) {
      resp
        .text()
        .then((t) => console.log(`[resp] ${resp.status()} ${u} -> ${t.substring(0, 500)}`))
        .catch(() => {});
    }
  });

  // 1. Login
  console.log("--- Logging in ---");
  const loginResp = await page.request.post(`${API}/login`, {
    data: { username: "bob", password: "pw" },
    headers: { "content-type": "application/json", "x-api-key": API_KEY },
  });
  console.log("Login:", loginResp.status());
  for (const h of await loginResp.headersArray()) {
    if (h.name.toLowerCase() === "set-cookie") {
      const m = h.value.match(/token=([^;]+)/);
      if (m)
        await context.addCookies([{ name: "token", value: m[1], domain: "172.18.0.9", path: "/" }]);
    }
  }

  // 2. Set arkkey in localStorage
  await page.goto(`${BASE}/bob`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  await page.evaluate((key) => {
    localStorage.setItem("arkkey", JSON.stringify(key));
  }, ARK_KEY);

  // 3. Reload to trigger sync
  console.log("\n--- Reloading with arkkey set ---");
  await page.goto(`${BASE}/bob`, { waitUntil: "domcontentloaded" });

  console.log("--- Waiting 30s for SDK + sync ---");
  await page.waitForTimeout(30000);

  // 4. Check results
  console.log("\n--- Checking accounts ---");
  const acctResp = await page.request.get(`${API}/accounts`, {
    headers: {
      cookie: (await context.cookies()).map((c) => `${c.name}=${c.value}`).join("; "),
    },
  });
  const accounts = await acctResp.json();
  for (const a of accounts) {
    console.log(`Account: ${a.name} (${a.type}) balance=${a.balance}`);
    if (a.type === "ark") {
      console.log("  arkAddress:", a.arkAddress);
    }
  }

  // 5. Check payments
  console.log("\n--- Checking payments ---");
  const payResp = await page.request.get(`${API}/payments`, {
    headers: {
      cookie: (await context.cookies()).map((c) => `${c.name}=${c.value}`).join("; "),
    },
  });
  const payments = await payResp.json();
  console.log(`Total payments: ${payments.length}`);
  for (const p of payments.slice(0, 5)) {
    console.log(`  ${p.type} ${p.amount} ${p.hash?.substring(0, 16)}...`);
  }

  await browser.close();
})();
