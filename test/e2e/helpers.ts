import { execSync } from "child_process";
import type { Browser, Page } from "@playwright/test";
import { expect } from "@playwright/test";

// --- Environment ---
export const arkWalletPassword = process.env.E2E_ARK_WALLET_PASSWORD || "testpw123";
export const aliceUsername = process.env.E2E_ALICE_USERNAME || "alice";
export const alicePassword = process.env.E2E_ALICE_PASSWORD || "pw";
export const bobUsername = process.env.E2E_BOB_USERNAME || "bob";
export const bobPassword = process.env.E2E_BOB_PASSWORD || "pw";
export const testSecret = process.env.E2E_TEST_SECRET;
export const apiBaseUrl = process.env.E2E_API_BASE_URL || "http://localhost:3119";
export const pauseAtEnd = process.env.E2E_PAUSE_AT_END === "true";

// --- Login helpers ---

export async function login(page: Page, username: string, password: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await page.waitForTimeout(3_000);
    await page.goto("/login");
    await page.getByTestId("login-username").waitFor({ state: "visible", timeout: 15_000 });
    await page.getByTestId("login-username").fill(username);
    await page.locator('input[name="password"]').first().fill(password);
    await page.getByTestId("login-submit").click();
    const ok = await page
      .waitForURL(new RegExp(`/${username}(?:[/?#]|$)`), { timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (ok) return;
    console.log(`[e2e] Login attempt ${attempt + 1} failed, retrying...`);
  }
  throw new Error(`Login failed for ${username} after 5 attempts`);
}

export async function loginNewContext(browser: Browser, username: string, password: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, username, password);
  return { context, page };
}

export async function apiLogin(page: Page, username: string, password: string) {
  const res = await page.request.post(`${apiBaseUrl}/login`, {
    data: { username, password },
  });
  const data = await res.json();
  return data.token as string;
}

export async function apiGetBalance(page: Page, token: string) {
  const res = await page.request.get(`${apiBaseUrl}/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.balance as number;
}

export async function apiGetInvoice(page: Page, invoiceId: string) {
  const res = await page.request.get(`${apiBaseUrl}/invoice/${invoiceId}`);
  return res.json();
}

// --- Invoice creation via UI ---

export async function createBitcoinInvoiceViaUI(page: Page, username: string) {
  await page.goto(`/${username}/receive?address_type=bech32`);
  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });

  const invoiceId = page.url().match(/\/invoice\/([^/?#]+)/)?.[1];
  expect(invoiceId, "Should have invoice ID in URL").toBeTruthy();

  const invoiceText = await page.getByTestId("invoice-text").first().innerText({ timeout: 10_000 });
  const address = invoiceText.trim().replace(/\s+/g, "");
  expect(
    address.startsWith("bcrt1") || address.startsWith("bc1"),
    `Expected bitcoin address, got: ${address}`,
  ).toBeTruthy();

  return { invoiceId: invoiceId!, address };
}

export async function createLightningInvoiceViaUI(page: Page, username: string) {
  await page.goto(`/${username}/receive`);
  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });

  // Click "More options" then "Bolt 11" to switch invoice type
  const moreOptions = page.getByText("More options");
  if (await moreOptions.isVisible({ timeout: 3000 }).catch(() => false)) {
    await moreOptions.click();
  }

  const bolt11Button = page.locator("button", { hasText: "Bolt 11" });
  await expect(bolt11Button).toBeVisible({ timeout: 5000 });
  await bolt11Button.click();

  // Wait for invoice to regenerate
  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 10_000 });

  const invoiceId = page.url().match(/\/invoice\/([^/?#]+)/)?.[1];
  expect(invoiceId).toBeTruthy();

  const invoiceText = (
    await page.getByTestId("invoice-text").first().innerText({ timeout: 10_000 })
  ).trim();
  const bolt11 = invoiceText.replace(/\s+/g, "");

  expect(
    bolt11.toLowerCase().startsWith("lnbcrt") || bolt11.toLowerCase().startsWith("lnbc"),
    `Expected bolt11, got: ${bolt11.substring(0, 30)}`,
  ).toBeTruthy();

  return { invoiceId: invoiceId!, bolt11 };
}

export async function createArkInvoiceViaUI(page: Page, password: string) {
  const arkCard = page.locator('[data-testid="account-card"][data-account-type="ark"]');
  await expect(arkCard.first()).toBeVisible({ timeout: 10_000 });

  const walletPassInput = page.getByTestId("walletpass-input");
  let invoiceOpened = false;

  const count = await arkCard.count();
  for (let i = 0; i < count; i++) {
    const card = arkCard.nth(i);
    await card.scrollIntoViewIfNeeded();

    const accountHref = await card.locator('a[href^="/account/"]').first().getAttribute("href");
    const accountId = accountHref?.split("/account/")[1];

    await card.locator('a[href="/invoice"]').first().click({ force: true });

    if (
      await walletPassInput
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await walletPassInput.fill(password);
      await page.getByTestId("walletpass-submit").click();
    }

    invoiceOpened = await page
      .waitForURL(/\/invoice\/[^/?#]+/, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!invoiceOpened && accountId) {
      await page.evaluate((aid) => {
        document.cookie = `aid=${aid}; path=/; max-age=86400`;
      }, accountId);
      await page.goto("/invoice");
      invoiceOpened = await page
        .waitForURL(/\/invoice\/[^/?#]+/, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }

    if (invoiceOpened) break;

    if (
      await page
        .getByTestId("walletpass-cancel")
        .isVisible()
        .catch(() => false)
    ) {
      await page.getByTestId("walletpass-cancel").click();
    }
  }

  expect(invoiceOpened).toBeTruthy();

  const invoiceText = (await page.getByTestId("invoice-text").first().innerText()).trim();
  const addressMatch = invoiceText.match(/t?ark1[a-z0-9]+/i);
  expect(addressMatch).toBeTruthy();

  const invoiceId = page.url().split("/invoice/")[1]?.split(/[/?#]/)[0];
  expect(invoiceId).toBeTruthy();

  return { invoiceId: invoiceId!, address: addressMatch![0] };
}

export async function createVaultBitcoinInvoiceViaUI(page: Page) {
  const vaultCard = page.locator('[data-testid="account-card"][data-account-type="bitcoin"]');
  await expect(vaultCard.first()).toBeVisible({ timeout: 10_000 });

  await vaultCard.first().getByTestId("account-receive").click({ force: true });
  await page.waitForURL(/\/invoice\/[^/?#]+/, { timeout: 15_000 });

  const invoiceText = await page.getByTestId("invoice-text").first().innerText({ timeout: 10_000 });
  const address = invoiceText.trim().replace(/\s+/g, "");
  expect(
    address.startsWith("bcrt1") || address.startsWith("bc1"),
    `Expected bitcoin address, got: ${address}`,
  ).toBeTruthy();

  const invoiceId = page.url().split("/invoice/")[1]?.split(/[/?#]/)[0];
  expect(invoiceId).toBeTruthy();

  return { invoiceId: invoiceId!, address };
}

// --- Send helpers ---

export async function pasteAndSend(page: Page, text: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`[e2e] pasteAndSend retry ${attempt + 1}...`);
      await page.waitForTimeout(2_000);
    }

    await page.goto("/send");
    await page.waitForLoadState("load");

    const textarea = page.locator('textarea[name="text"]');
    await expect(textarea).toBeVisible({ timeout: 10_000 });
    await textarea.fill(text);

    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible({ timeout: 5_000 });
    await submitBtn.click();

    // Wait for navigation away from /send
    const navigated = await page
      .waitForURL((url) => url.pathname !== "/send" && url.pathname !== "/send/", {
        timeout: 15_000,
      })
      .then(() => true)
      .catch(() => false);

    if (navigated) return;

    // Check if form shows an error (server might have been slow)
    const errorText = await page
      .locator(".text-red-600")
      .first()
      .innerText({ timeout: 1000 })
      .catch(() => "");
    if (errorText) console.log(`[e2e] pasteAndSend error: ${errorText}`);
  }

  throw new Error(`pasteAndSend failed after 3 attempts for: ${text.substring(0, 40)}...`);
}

export async function fillNumpadAmount(page: Page, amount: number) {
  const amountInput = page.locator('[aria-label="Amount input"]');
  await expect(amountInput).toBeVisible({ timeout: 5_000 });

  // Ensure sats mode: swap button shows lightning icon when in fiat mode
  const swapButton = page.locator('[aria-label="Swap currency display"]');
  if (await swapButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const hasLightning = await swapButton.locator('iconify-icon[icon="ph:lightning-fill"]').count();
    if (hasLightning > 0) {
      await swapButton.click();
      await page.waitForTimeout(300);
    }
  }

  await amountInput.click();
  await page.keyboard.press("Control+a");
  await page.keyboard.type(String(amount));

  const nextButton = page.locator("button.btn-accent");
  await expect(nextButton).toBeVisible({ timeout: 5_000 });
  await nextButton.click();
}

export async function clickSendButton(page: Page) {
  const sendButton = page.locator('button[type="submit"]');
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  await sendButton.click();
}

export async function waitForSentRedirect(page: Page, timeout = 15_000) {
  await page.waitForURL(/\/sent\//, { timeout });
}

/** Race between /sent/ redirect and an error appearing on page. Fails fast on error. */
export async function waitForSendComplete(page: Page, timeout = 60_000) {
  const result = await Promise.race([
    page
      .waitForURL(/\/sent\//, { timeout })
      .then(() => ({ ok: true as const })),
    // Poll for error text that appears when send fails
    (async () => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        const errorEl = page.locator(".text-red-600");
        const errorText = await errorEl.first().innerText({ timeout: 500 }).catch(() => "");
        if (errorText && errorText.length > 3) {
          return { ok: false as const, error: errorText };
        }
        await page.waitForTimeout(1_000);
      }
      return { ok: false as const, error: `Send timed out after ${timeout}ms` };
    })(),
  ]);

  if (!result.ok) {
    throw new Error(`Send failed: ${result.error}`);
  }
}

export async function waitForPaidRedirect(page: Page, invoiceId: string, timeout = 30_000) {
  await page.waitForURL(new RegExp(`/invoice/${invoiceId}/paid(?:[/?#]|$)`), { timeout });
}

// --- Docker helpers ---

export function dockerExec(container: string, command: string): string {
  return execSync(`docker exec ${container} ${command}`, {
    encoding: "utf-8",
    timeout: 30_000,
  }).trim();
}

export function lightningPay(bolt11: string): string {
  return dockerExec("clb", `lightning-cli pay ${bolt11}`);
}

export function lightningInvoice(amountMsat: number, label: string): string {
  const result = dockerExec("clb", `lightning-cli invoice ${amountMsat} "${label}" "${label}"`);
  return JSON.parse(result).bolt11 as string;
}

export function getBitcoinAddress(): string {
  return dockerExec("bc", "bitcoin-cli -regtest -rpcwallet=external getnewaddress");
}

export function bitcoinSend(address: string, amountBtc: string): string {
  return dockerExec(
    "bc",
    `bitcoin-cli -regtest -rpcwallet=coinos sendtoaddress "${address}" ${amountBtc}`,
  );
}

export function mineBlocks(n: number): void {
  const minerAddr = dockerExec("bc", "bitcoin-cli -regtest -rpcwallet=coinos getnewaddress");
  dockerExec("bc", `bitcoin-cli -regtest -rpcwallet=coinos generatetoaddress ${n} "${minerAddr}"`);
}

// --- Polling helpers ---

export async function waitForInvoicePaid(
  page: Page,
  invoiceId: string,
  amount: number,
  { interval = 1000, maxAttempts = 30 } = {},
) {
  let status: any;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await page.request.get(`${apiBaseUrl}/invoice/${invoiceId}`);
    if (res.ok()) {
      status = await res.json();
      if ((status?.received || 0) >= amount || (status?.pending || 0) >= amount) {
        return status;
      }
    }
    await page.waitForTimeout(interval);
  }
  throw new Error(
    `Invoice ${invoiceId} not paid after ${maxAttempts} attempts: ${JSON.stringify(status)}`,
  );
}

// --- Ark helpers ---

export async function sendArkFromTestEndpoint(
  page: Page,
  address: string,
  amount: number,
  iid?: string,
) {
  const sendResult = await page.evaluate(
    async ({ address, testSecret, amount, iid }) => {
      const body: any = { address, amount };
      if (iid) body.iid = iid;
      const res = await fetch("/api/test/ark/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-secret": testSecret,
        },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    },
    { address, testSecret: testSecret!, amount, iid },
  );
  expect(
    sendResult.ok,
    `/test/ark/send failed (${sendResult.status}): ${sendResult.text}`,
  ).toBeTruthy();
  return sendResult;
}

// --- Navigation helpers ---

/** Wait for dashboard to be interactive (replaces unreliable networkidle) */
export async function waitForDashboard(page: Page, timeout = 15_000) {
  await page.waitForLoadState("domcontentloaded");
  // Wait for at least one account card to appear on the dashboard
  await page.locator('[data-testid="account-card"]').first().waitFor({ state: "visible", timeout });
}

/** Wait for page to be interactive after navigation */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
}

// --- Account helpers ---

export async function setActiveAccount(page: Page, accountId: string) {
  await page.evaluate((aid) => {
    document.cookie = `aid=${aid}; path=/; max-age=86400`;
  }, accountId);
}

export async function ensureArkAccount(page: Page, _password: string) {
  await page.goto("/account/ark");
  await page.waitForLoadState("domcontentloaded");

  // The /account/ark page either:
  // 1. Redirects immediately if user already has an ark account (server-side)
  // 2. Auto-creates via getWalletEntropy() on mount then redirects (client-side goto)
  // 3. Shows unlock buttons (btn-accent) if no wallet entropy available
  //
  // Wait for redirect away from /account/ark (covers cases 1 and 2)
  const redirected = await page
    .waitForURL((u) => !u.pathname.includes("/account/ark"), { timeout: 45_000 })
    .then(() => true)
    .catch(() => false);

  if (redirected) {
    console.log("[e2e] Ark account ready (redirected from /account/ark)");
    return;
  }

  // If still on /account/ark, check if unlock buttons appeared
  const unlockBtn = page.locator("button.btn-accent");
  const hasUnlock = await unlockBtn.first().isVisible().catch(() => false);
  if (hasUnlock) {
    console.log("[e2e] Ark account page shows unlock buttons — wallet entropy not available");
  } else {
    console.log("[e2e] Ark account page did not redirect — account may already exist or creation failed");
  }
}
