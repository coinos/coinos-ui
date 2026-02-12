import { chromium } from "playwright";

const BASE = "https://staging.coinos.io";
const API = "https://staging.coinos.io/api";
const API_KEY = "test-playwright-key";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
  page.on("pageerror", (err) => console.log("[page error]", err.message));

  // Monitor relevant requests
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("ark") || u.includes("sync") || u.includes("invoice") || u.includes("ws")) {
      if (
        !u.includes("__data") &&
        !u.includes(".png") &&
        !u.includes(".js") &&
        !u.includes(".css")
      ) {
        console.log(`[req] ${req.method()} ${u.substring(0, 120)}`);
      }
    }
  });
  page.on("response", (resp) => {
    const u = resp.url();
    if (u.includes("ark/sync") || (u.includes("invoice") && !u.includes("__data"))) {
      resp
        .text()
        .then((t) =>
          console.log(`[resp] ${resp.status()} ${u.substring(0, 80)} -> ${t.substring(0, 300)}`),
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
      if (m) {
        await context.addCookies([
          {
            name: "token",
            value: m[1],
            domain: "staging.coinos.io",
            path: "/",
          },
        ]);
      }
    }
  }

  // Set the ark account cookie so invoice page recognizes us as the owner
  await context.addCookies([
    {
      name: "aid",
      value: "6eb11dd0-e591-4331-a9a7-93e69804b28b",
      domain: "staging.coinos.io",
      path: "/",
    },
  ]);

  // 2. Create an ark invoice for 1000 sats (matches existing VTXO)
  console.log("\n--- Creating ark invoice for 1000 sats ---");
  const invResp = await page.request.post(`${API}/invoice`, {
    data: {
      invoice: {
        type: "ark",
        amount: 1000,
        aid: "6eb11dd0-e591-4331-a9a7-93e69804b28b",
      },
      user: { username: "bob" },
    },
    headers: { "content-type": "application/json", "x-api-key": API_KEY },
  });
  const invoice = await invResp.json();
  console.log("Invoice created:", invoice.id, "amount:", invoice.amount);

  // 3. Wait a moment for watcher to process existing VTXOs
  await new Promise((r) => setTimeout(r, 3000));

  // 4. Navigate to the invoice page — should redirect to /paid
  console.log("\n--- Navigating to invoice page ---");
  const invoiceUrl = `${BASE}/invoice/${invoice.id}`;
  console.log("URL:", invoiceUrl);
  await page.goto(invoiceUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const finalUrl = page.url();
  console.log("Final URL:", finalUrl);
  console.log("Redirected to paid?", finalUrl.includes("/paid"));

  // 5. Check page content
  const bodyText = await page.textContent("body");
  if (bodyText.includes("1,000") || bodyText.includes("1000")) {
    console.log("SUCCESS: Payment amount visible on page");
  }

  await page.screenshot({ path: "/tmp/ark-invoice-result.png" });
  console.log("Screenshot saved to /tmp/ark-invoice-result.png");

  await browser.close();
})();
