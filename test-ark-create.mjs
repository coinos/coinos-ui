import { chromium } from "playwright";

const BASE = "http://172.18.0.9:3000";
const API = "http://172.18.0.12:3119";
const API_KEY = "test-playwright-key";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on("console", (msg) =>
    console.log(`[browser:${msg.type()}]`, msg.text()),
  );
  page.on("pageerror", (err) => console.log("[page error]", err.message));

  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("account") || u.includes("arkade.computer")) {
      console.log(
        `[req] ${req.method()} ${u} ${req.postData()?.substring(0, 500) || ""}`,
      );
    }
  });
  page.on("response", (resp) => {
    const u = resp.url();
    if (u.includes("account") && !u.includes("__data")) {
      resp
        .text()
        .then((t) =>
          console.log(`[resp] ${resp.status()} ${u} -> ${t.substring(0, 500)}`),
        )
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
        await context.addCookies([
          { name: "token", value: m[1], domain: "172.18.0.9", path: "/" },
        ]);
    }
  }

  // 2. Go to ark account creation page
  console.log("\n--- Going to /account/ark ---");
  await page.goto(`${BASE}/account/ark`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  // Wait for the SDK to derive an address (it calls Wallet.create on mount)
  console.log("Waiting for SDK to initialize...");
  await page.waitForTimeout(10000);

  // 3. Click "Reveal backup key"
  console.log("\n--- Revealing backup key ---");
  const revealBtn = page.locator("button", { hasText: "Reveal backup key" });
  if (await revealBtn.count()) {
    await revealBtn.click();
    await page.waitForTimeout(1000);
    const nsecText = await page
      .locator("button[aria-label='Copy backup key']")
      .innerText()
      .catch(() => "not found");
    console.log("Backup key:", nsecText.substring(0, 30), "...");
  }

  // 4. Click "I've backed it up"
  const confirmBtn = page.locator("button", { hasText: "backed it up" });
  if (await confirmBtn.count()) {
    await confirmBtn.click();
    await page.waitForTimeout(1000);
    console.log("Confirmed backup");
  }

  // 5. Set password and confirm
  const pwInput = page.locator('input[name="password"]');
  const confirmInput = page.locator('input[placeholder="Confirm password"]');
  if (await pwInput.count()) {
    await pwInput.fill("123");
    await confirmInput.fill("123");
    console.log("Filled passwords");

    await page.screenshot({ path: "/tmp/ark-create-form.png" });

    // 6. Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    console.log("--- Submitted ---");
    await page.waitForTimeout(15000);
    console.log("URL after submit:", page.url());
  } else {
    console.log("Password form not found");
    await page.screenshot({ path: "/tmp/ark-create-debug.png" });
  }

  // 7. Check accounts
  console.log("\n--- Checking accounts ---");
  const acctResp = await page.request.get(`${API}/accounts`, {
    headers: {
      cookie: (await context.cookies())
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
    },
  });
  const accounts = await acctResp.json();
  for (const a of accounts) {
    console.log(`Account: ${a.name} (${a.type}) balance=${a.balance}`);
    if (a.type === "ark") {
      console.log("  arkAddress:", a.arkAddress);
    }
  }

  // 8. Verify SDK derives the same address
  const arkAcct = accounts.find((a) => a.type === "ark");
  if (arkAcct) {
    const arkkey = await page.evaluate(() => {
      const v = localStorage.getItem("arkkey");
      return v ? JSON.parse(v) : null;
    });
    console.log("\narkkey from localStorage:", arkkey);

    if (arkkey) {
      // Use the bundled SDK to verify
      const sdkAddr = await page.evaluate(async (key) => {
        try {
          const sdk = await import("/_app/immutable/chunks/Ciyv5OgZ.js");
          const identity = sdk.SingleKey.fromHex(key);
          const wallet = await sdk.Wallet.create({
            identity,
            arkServerUrl: "https://arkade.computer",
          });
          return await wallet.getAddress();
        } catch (e) {
          return "error: " + e.message;
        }
      }, arkkey);

      console.log("SDK-derived address:", sdkAddr);
      console.log("Stored address:    ", arkAcct.arkAddress);
      console.log("Match:", sdkAddr === arkAcct.arkAddress);
    }
  }

  await browser.close();
})();
