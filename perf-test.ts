import { chromium } from "@playwright/test";

const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect all network requests during navigation
  const requests: { url: string; duration: number; size: number }[] = [];

  // Login as bob
  console.log("=== Logging in as bob ===");
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', "bob");
  await page.fill('input[name="password"]', "pw");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/bob", { timeout: 10000 });
  console.log("Logged in, at:", page.url());

  // Wait for page to fully settle
  await page.waitForTimeout(2000);

  // Now measure navigation to /invoice/lnurl
  console.log("\n=== Navigating to /invoice/lnurl ===");

  // Enable request interception to measure timings
  const navRequests: { url: string; method: string; duration: number }[] = [];

  page.on("request", (req) => {
    (req as any)._startTime = Date.now();
  });

  page.on("response", (res) => {
    const req = res.request();
    const start = (req as any)._startTime;
    if (start) {
      navRequests.push({
        url: req.url().replace(BASE, ""),
        method: req.method(),
        duration: Date.now() - start,
      });
    }
  });

  // Take screenshot before navigation
  await page.screenshot({ path: "/tmp/perf-before.png" });

  const navStart = Date.now();

  // Click the Receive button on the first account (custodial/spending)
  const receiveBtn = page.locator('[data-testid="account-receive"]').first();
  const receiveHref = await receiveBtn.locator("..").getAttribute("href");
  console.log("Receive link href:", receiveHref);

  await receiveBtn.click();

  // Wait for the invoice page to load
  await page.waitForURL("**/invoice/**", { timeout: 10000 });
  const urlReady = Date.now() - navStart;
  console.log(`URL changed in ${urlReady}ms`);

  // Wait for QR to appear
  try {
    await page.waitForSelector('.invoice img[src]', { timeout: 5000 });
    const qrReady = Date.now() - navStart;
    console.log(`QR img element appeared in ${qrReady}ms`);
  } catch {
    console.log("QR img not found within 5s");
  }

  // Check if QR image has actually loaded (naturalWidth > 0)
  try {
    await page.waitForFunction(
      () => {
        const img = document.querySelector(".invoice img") as HTMLImageElement;
        return img && img.naturalWidth > 0;
      },
      { timeout: 5000 }
    );
    const qrLoaded = Date.now() - navStart;
    console.log(`QR image fully loaded in ${qrLoaded}ms`);
  } catch {
    console.log("QR image did not fully load within 5s");
  }

  const totalTime = Date.now() - navStart;

  await page.screenshot({ path: "/tmp/perf-after.png" });

  console.log(`\nTotal navigation time: ${totalTime}ms`);
  console.log("\n=== Network requests during navigation ===");
  for (const r of navRequests.sort((a, b) => b.duration - a.duration)) {
    console.log(`  ${r.method} ${r.url} - ${r.duration}ms`);
  }

  // Now measure a second navigation (back and forth) to see cached behavior
  console.log("\n=== Going back to profile ===");
  navRequests.length = 0;
  await page.goBack();
  await page.waitForTimeout(1000);

  console.log("\n=== Second navigation to /invoice/lnurl ===");
  navRequests.length = 0;
  const nav2Start = Date.now();
  await receiveBtn.click();
  await page.waitForURL("**/invoice/**", { timeout: 10000 });
  const url2Ready = Date.now() - nav2Start;
  console.log(`URL changed in ${url2Ready}ms`);

  try {
    await page.waitForFunction(
      () => {
        const img = document.querySelector(".invoice img") as HTMLImageElement;
        return img && img.naturalWidth > 0;
      },
      { timeout: 5000 }
    );
    const qr2Loaded = Date.now() - nav2Start;
    console.log(`QR image fully loaded in ${qr2Loaded}ms`);
  } catch {
    console.log("QR image did not fully load within 5s");
  }

  await page.screenshot({ path: "/tmp/perf-after2.png" });

  console.log(`\nTotal 2nd navigation time: ${Date.now() - nav2Start}ms`);
  console.log("\n=== Network requests during 2nd navigation ===");
  for (const r of navRequests.sort((a, b) => b.duration - a.duration)) {
    console.log(`  ${r.method} ${r.url} - ${r.duration}ms`);
  }

  // Also capture performance entries
  const perfEntries = await page.evaluate(() => {
    return performance.getEntriesByType("navigation").map((e: any) => ({
      name: e.name,
      duration: e.duration,
      domContentLoaded: e.domContentLoadedEventEnd - e.startTime,
      loadEvent: e.loadEventEnd - e.startTime,
    }));
  });
  console.log("\n=== Performance entries ===", perfEntries);

  await browser.close();
})();
