import { execSync } from "child_process";
import { createHash, scryptSync } from "crypto";
import type { Browser, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { finalizeEvent, nip19 } from "nostr-tools";
import { HDKey } from "@scure/bip32";
import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

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

// Derive nsec from username+password using the same scrypt params as the app
function deriveNsec(username: string, password: string): string {
  const salt = `coinos:auth:${username.toLowerCase().replace(/\s/g, "")}`;
  const sk = scryptSync(password, salt, 32, { N: 65536, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
  return nip19.nsecEncode(new Uint8Array(sk));
}

export async function login(page: Page, username: string, password: string) {
  // Use API login to set auth cookies directly — avoids slow scrypt derivation in browser
  const res = await page.request.post(`${apiBaseUrl}/login`, {
    data: { username, password },
  });
  if (!res.ok()) throw new Error(`API login failed for ${username}: ${res.status()}`);
  const { token } = await res.json();

  // Set cookies that SvelteKit expects
  await page.context().addCookies([
    { name: "token", value: token, domain: "127.0.0.1", path: "/" },
    { name: "username", value: username, domain: "127.0.0.1", path: "/" },
  ]);

  // Derive nsec and register init script so ark wallet can auto-unlock on any page load.
  // Also skip settle() to prevent it from registering VTXOs in pending rounds that
  // never complete (arkd rounds abort with "0 intents"), blocking sendArk().
  const nsec = deriveNsec(username, password);
  await page.addInitScript((ns) => {
    localStorage.setItem("nsec", ns);
    localStorage.setItem("ark:skipSettle", "1");
  }, nsec);

  // Navigate to dashboard to confirm login worked
  await page.goto(`/${username}`);
  await page.waitForURL(new RegExp(`/${username}(?:[/?#]|$)`), { timeout: 15_000 });
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

export async function createBitcoinInvoiceViaUI(page: Page, _username: string) {
  await page.goto(`/invoice?type=bitcoin&address_type=bech32`);
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

export async function createLightningInvoiceViaUI(page: Page, _username: string) {
  await page.goto(`/invoice`);
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

  // Ensure sats mode: when in fiat mode, the lightning icon span is visible
  const swapButton = page.locator('[aria-label="Swap currency display"]');
  if (await swapButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const lightningSpan = swapButton.locator('svg').first();
    const isInFiatMode = await lightningSpan.isVisible({ timeout: 1_000 }).catch(() => false);
    if (isInFiatMode) {
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

const ARK_LIQUIDITY_RE = /VTXO_RECOVERABLE|VTXO_ALREADY_SPENT|VTXO_ALREADY_REGISTERED|insufficient funds|not enough liquidity/i;

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

  if (!sendResult.ok && ARK_LIQUIDITY_RE.test(sendResult.text)) {
    test.skip(true, `Ark server has no liquidity: ${sendResult.text}`);
  }

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

/** Wait for ark wallet to discover VTXOs without triggering settle() */
export async function waitForArkSync(page: Page, _username: string, _timeout = 15_000) {
  // Don't navigate to the dashboard — that triggers initArk → settle() which
  // registers VTXOs in a round, making them unavailable for sendArk().
  // Just wait a bit for the ark server to index the new VTXOs.
  await page.waitForTimeout(3_000);
}

// --- Account helpers ---

export async function setActiveAccount(page: Page, accountId: string) {
  await page.evaluate((aid) => {
    document.cookie = `aid=${aid}; path=/; max-age=86400`;
  }, accountId);
}

export async function ensureArkAccount(page: Page, _password: string, token?: string) {
  // Wait for autoUnlockArk() to derive the arkkey and write it to localStorage.
  // This happens in onMount of the app layout after login() navigates to the dashboard.
  // IMPORTANT: We must use THIS key (not re-derive) because Schnorr signing uses random
  // nonces, so each call to tryDeriveFromNsec() produces a different key.
  const arkKey = await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      const raw = localStorage.getItem("arkkey");
      if (raw && raw !== '""' && raw !== '"undefined"' && raw !== "undefined") {
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed === "string" && parsed.length >= 32) return parsed;
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  });

  if (!arkKey) {
    console.log("[e2e] WARNING: arkkey not found in localStorage after 15s");
    return;
  }
  console.log(`[e2e] arkkey ready: ${arkKey.slice(0, 12)}...`);

  // Compute the client wallet address — the fresh import reads arkkey from localStorage
  const clientAddress = await page.evaluate(async () => {
    const { getAddress } = await import("/src/lib/ark.ts");
    return await getAddress();
  });

  console.log(`[e2e] Client ark address: ...${clientAddress.slice(-30)}`);

  // Get auth token from page cookies if not provided
  if (!token) {
    const cookies = await page.context().cookies();
    token = cookies.find((c) => c.name === "token")?.value;
  }
  const authHeaders = token ? { authorization: `Bearer ${token}` } : {};

  // Check/create ark account — retry to handle race conditions with parallel tests
  for (let attempt = 0; attempt < 3; attempt++) {
    const accountsRes = await page.request.get(`${apiBaseUrl}/accounts`, { headers: authHeaders });
    if (accountsRes.ok()) {
      const accounts = await accountsRes.json();
      const arkAccount = accounts.find((a: any) => a.type === "ark");

      if (arkAccount?.arkAddress === clientAddress) {
        console.log("[e2e] Ark account exists with matching address");
        return;
      }

      if (arkAccount) {
        console.log(`[e2e] Ark address mismatch, deleting stale account`);
        await page.request.post(`${apiBaseUrl}/account/delete`, {
          data: { id: arkAccount.id },
          headers: authHeaders,
        });
      }
    }

    const createRes = await page.request.post(`${apiBaseUrl}/accounts`, {
      data: { name: "ark", type: "ark", arkAddress: clientAddress },
      headers: authHeaders,
    });

    if (createRes.ok()) {
      console.log("[e2e] Ark account created via API with matching address");
      return;
    }

    // "Already have an Ark vault" means another test created one — retry to check/update
    const errText = await createRes.text().catch(() => "");
    console.log(`[e2e] Account creation attempt ${attempt + 1} failed (${createRes.status()}): ${errText}`);
    await page.waitForTimeout(1_000);
  }
}

// --- Bitcoin vault helpers ---

const REGTEST_VERSIONS = { private: 0x04358394, public: 0x043587cf };

/**
 * Derive the bitcoin vault pubkey and fingerprint from a username+password,
 * using the same derivation path as the app:
 *   scrypt(password, salt) → nsec → sign fixed nostr event → SHA-256(sig) → entropy
 *   → first 16 bytes → mnemonic → seed → HDKey → m/84'/0'/0' → publicExtendedKey
 */
export async function deriveVaultCredentials(username: string, password: string) {
  const salt = `coinos:auth:${username.toLowerCase().replace(/\s/g, "")}`;
  const sk = scryptSync(password, salt, 32, { N: 65536, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });

  const signed = finalizeEvent(
    { kind: 1, created_at: 0, content: "coinos-wallet-key-derivation", tags: [] } as any,
    new Uint8Array(sk),
  );

  const sigBytes = Buffer.from(signed.sig, "hex");
  const entropy = createHash("sha256").update(sigBytes).digest();

  const mnemonic = entropyToMnemonic(new Uint8Array(entropy.slice(0, 16)), wordlist);
  const seed = await mnemonicToSeed(mnemonic);
  const master = HDKey.fromMasterSeed(seed, REGTEST_VERSIONS);
  const child = master.derive("m/84'/0'/0'");

  return {
    pubkey: child.publicExtendedKey,
    fingerprint: master.fingerprint.toString(16).padStart(8, "0"),
  };
}

/**
 * Find or create a bitcoin vault account for the given user whose keys match
 * the test-derived credentials. Returns the account object.
 */
export async function ensureVaultAccount(
  page: Page,
  token: string,
  username: string,
  password: string,
) {
  const { pubkey, fingerprint } = await deriveVaultCredentials(username, password);

  const accountsRes = await page.request.get(`${apiBaseUrl}/accounts`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(accountsRes.ok()).toBeTruthy();
  const accounts = await accountsRes.json();

  // Check for existing matching vault
  const existing = accounts.find(
    (a: any) => a.type === "bitcoin" && a.pubkey === pubkey,
  );
  if (existing) {
    console.log(`[e2e] Found existing vault account: ${existing.id}`);
    return existing;
  }

  // Create new vault account
  const createRes = await page.request.post(`${apiBaseUrl}/accounts`, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    data: {
      name: "Test BTC Vault",
      type: "bitcoin",
      pubkey,
      fingerprint,
    },
  });
  expect(createRes.ok(), `Vault creation failed: ${await createRes.text()}`).toBeTruthy();
  const account = await createRes.json();
  console.log(`[e2e] Created vault account: ${account.id}, pubkey: ${pubkey.slice(0, 20)}...`);
  return account;
}

/**
 * Fund a vault account by creating an invoice, sending from bitcoind, and mining.
 * Returns when the vault has at least `minBalance` sats.
 */
export async function fundVaultAccount(
  page: Page,
  token: string,
  accountId: string,
  username: string,
  minBalance = 10_000,
) {
  // Check current balance
  const balRes = await page.request.get(`${apiBaseUrl}/account/${accountId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const acct = await balRes.json();
  if ((acct.balance || 0) >= minBalance) {
    console.log(`[e2e] Vault already funded: ${acct.balance} sats`);
    return acct.balance;
  }

  // Create invoice to get a receive address
  const invoiceRes = await page.request.post(`${apiBaseUrl}/invoice`, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    data: {
      invoice: { aid: accountId, type: "bitcoin", address_type: "bech32", amount: 0 },
      user: { username, currency: "USD" },
    },
  });
  expect(invoiceRes.ok(), `Invoice creation failed: ${await invoiceRes.text()}`).toBeTruthy();
  const invoice = await invoiceRes.json();
  const address = invoice.hash;
  console.log(`[e2e] Vault receive address: ${address}`);

  // Send from bitcoind (use external wallet, not the coinos hot wallet)
  const btcAmount = (minBalance / 1e8).toFixed(8);
  const txid = dockerExec(
    "bc",
    `bitcoin-cli -regtest -rpcwallet=external sendtoaddress "${address}" ${btcAmount}`,
  );
  console.log(`[e2e] Funded vault: txid=${txid}`);

  // Mine blocks and wait for esplora/server to index
  mineBlocks(1);
  await page.waitForTimeout(5_000);
  mineBlocks(1);
  await page.waitForTimeout(5_000);

  // Poll for balance
  for (let i = 0; i < 45; i++) {
    const res = await page.request.get(`${apiBaseUrl}/account/${accountId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if ((data.balance || 0) >= minBalance) {
      console.log(`[e2e] Vault balance: ${data.balance} sats`);
      return data.balance;
    }
    await page.waitForTimeout(2_000);
  }

  throw new Error(`Vault balance did not reach ${minBalance} after funding`);
}
