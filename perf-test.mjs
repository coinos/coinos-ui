import { chromium } from "playwright";

const BASE = "http://localhost:5173";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const reqs = [];
page.on("request", (r) => { r._t = Date.now(); });
page.on("response", (r) => {
  const req = r.request();
  if (req._t) reqs.push({ url: req.url().replace(BASE, ""), ms: Date.now() - req._t });
});

// Login
console.log("Logging in...");
await page.goto(BASE + "/login");
await page.fill('input[name="username"]', "bob");
await page.fill('input[name="password"]', "pw");
await page.click('button[type="submit"]');
await page.waitForURL("**/bob", { timeout: 15000 });
console.log("Logged in at", page.url());
await page.waitForTimeout(2000);

// First nav
reqs.length = 0;
console.log("\n=== Nav 1: dashboard -> /invoice/lnurl ===");
const t1 = Date.now();
const btn = page.locator('[data-testid="account-receive"]').first();
const href = await btn.locator("..").getAttribute("href");
console.log("Receive href:", href);
await btn.click();
await page.waitForURL("**/invoice/**", { timeout: 10000 });
console.log("URL ready:", Date.now() - t1, "ms");

try {
  await page.waitForFunction(() => {
    const img = document.querySelector(".invoice img");
    return img && img.naturalWidth > 0;
  }, { timeout: 5000 });
  console.log("QR loaded:", Date.now() - t1, "ms");
} catch { console.log("QR not loaded in 5s"); }

await page.screenshot({ path: "/tmp/nav1.png" });
console.log("Network requests:");
reqs.sort((a, b) => b.ms - a.ms).forEach((r) => console.log("  ", r.ms + "ms", r.url));

const domState = await page.evaluate(() => {
  const main = document.querySelector("main");
  const mainStyle = main ? getComputedStyle(main) : null;
  const qr = document.querySelector(".invoice img");
  return {
    mainVisibility: mainStyle?.visibility,
    invoiceExists: !!document.querySelector(".invoice"),
    qrSrc: qr?.getAttribute("src")?.substring(0, 100),
    qrWidth: qr?.naturalWidth,
  };
});
console.log("DOM state:", JSON.stringify(domState, null, 2));

// Second nav (cached)
reqs.length = 0;
console.log("\n=== Nav 2: back -> /invoice/lnurl (cached) ===");
await page.goBack();
await page.waitForTimeout(1000);
const t2 = Date.now();
await btn.click();
await page.waitForURL("**/invoice/**", { timeout: 10000 });
console.log("URL ready:", Date.now() - t2, "ms");
try {
  await page.waitForFunction(() => {
    const img = document.querySelector(".invoice img");
    return img && img.naturalWidth > 0;
  }, { timeout: 5000 });
  console.log("QR loaded:", Date.now() - t2, "ms");
} catch { console.log("QR not loaded in 5s"); }

await page.screenshot({ path: "/tmp/nav2.png" });
console.log("Network requests:");
reqs.sort((a, b) => b.ms - a.ms).forEach((r) => console.log("  ", r.ms + "ms", r.url));

await browser.close();
