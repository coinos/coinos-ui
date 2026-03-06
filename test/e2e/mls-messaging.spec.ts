import { expect, test, type Browser } from "@playwright/test";
import { aliceUsername, alicePassword, bobUsername, bobPassword, apiBaseUrl } from "./helpers";
import { decrypt as nip49decrypt } from "nostr-tools/nip49";
import { nip19 } from "nostr-tools";

test.describe("MLS messaging", () => {
  test.setTimeout(120_000);

  /** Login and store the correct nsec (decrypted from server ncryptsec) in localStorage. */
  async function loginWithNsec(browser: Browser, username: string, password: string) {
    const context = await browser.newContext();
    const page = await context.newPage();

    // API login
    const res = await page.request.post(`${apiBaseUrl}/login`, {
      data: { username, password },
    });
    if (!res.ok()) throw new Error(`Login failed for ${username}: ${res.status()}`);
    const { token, user } = await res.json();

    // Set auth cookies
    await page.context().addCookies([
      { name: "token", value: token, domain: "127.0.0.1", path: "/" },
      { name: "username", value: username, domain: "127.0.0.1", path: "/" },
    ]);

    // Decrypt the server's ncryptsec to get the real nsec
    const sk = nip49decrypt(user.nsec, password);
    const nsec = nip19.nsecEncode(sk);

    await page.addInitScript((ns) => {
      localStorage.setItem("nsec", ns);
    }, nsec);

    // Navigate to confirm login
    await page.goto(`/${username}`);
    await page.waitForURL(new RegExp(`/${username}(?:[/?#]|$)`), { timeout: 15_000 });

    return { context, page, pubkey: user.pubkey };
  }

  test("Alice and Bob exchange messages in real time", async ({ browser }) => {
    const { context: aliceCtx, page: alicePage, pubkey: alicePubkey } = await loginWithNsec(browser, aliceUsername, alicePassword);
    const { context: bobCtx, page: bobPage, pubkey: bobPubkey } = await loginWithNsec(browser, bobUsername, bobPassword);

    expect(alicePubkey).toBeTruthy();
    expect(bobPubkey).toBeTruthy();

    // Both navigate to each other's DM page
    await Promise.all([
      alicePage.goto(`/messages/${bobPubkey}`),
      bobPage.goto(`/messages/${alicePubkey}`),
    ]);

    // Wait for textareas to be enabled (canSend = true)
    const aliceTextarea = alicePage.locator("#message-contents");
    const bobTextarea = bobPage.locator("#message-contents");
    await expect(aliceTextarea).toBeEnabled({ timeout: 20_000 });
    await expect(bobTextarea).toBeEnabled({ timeout: 20_000 });

    // Give subscriptions time to reach EOSE
    await alicePage.waitForTimeout(5000);

    // --- Alice sends a message to Bob ---
    const aliceMsg = `Hello Bob! ${Date.now()}`;
    await aliceTextarea.fill(aliceMsg);
    await alicePage.keyboard.press("Enter");

    // Alice sees her message immediately (optimistic UI)
    const aliceSentBubble = alicePage.locator(".message-row.by-user .message").filter({ hasText: aliceMsg });
    await expect(aliceSentBubble).toBeVisible({ timeout: 5_000 });

    // Bob receives Alice's message
    const bobReceivedBubble = bobPage.locator(".message-row.by-other .message").filter({ hasText: aliceMsg });
    await expect(bobReceivedBubble).toBeVisible({ timeout: 30_000 });

    // --- Bob replies ---
    const bobMsg = `Hey Alice! ${Date.now()}`;
    await bobTextarea.fill(bobMsg);
    await bobPage.keyboard.press("Enter");

    // Bob sees his reply immediately
    const bobSentBubble = bobPage.locator(".message-row.by-user .message").filter({ hasText: bobMsg });
    await expect(bobSentBubble).toBeVisible({ timeout: 5_000 });

    // Alice receives Bob's reply
    const aliceReceivedBubble = alicePage.locator(".message-row.by-other .message").filter({ hasText: bobMsg });
    await expect(aliceReceivedBubble).toBeVisible({ timeout: 30_000 });

    // --- Messages persist after reload ---
    await alicePage.reload();
    const aliceSentAfterReload = alicePage.locator(".message").filter({ hasText: aliceMsg });
    await expect(aliceSentAfterReload).toBeVisible({ timeout: 15_000 });
    const bobMsgAfterReload = alicePage.locator(".message").filter({ hasText: bobMsg });
    await expect(bobMsgAfterReload).toBeVisible({ timeout: 15_000 });

    await aliceCtx.close();
    await bobCtx.close();
  });

  test("Messages appear in the chat list on /messages", async ({ browser }) => {
    const { context: aliceCtx, page: alicePage, pubkey: alicePubkey } = await loginWithNsec(browser, aliceUsername, alicePassword);

    const bobRes = await alicePage.request.get(`${apiBaseUrl}/users/${bobUsername}`);
    const bobPubkey = (await bobRes.json()).pubkey;

    await alicePage.goto(`/messages/${bobPubkey}`);
    const textarea = alicePage.locator("#message-contents");
    await expect(textarea).toBeEnabled({ timeout: 20_000 });

    const msg = `Chat list test ${Date.now()}`;
    await textarea.fill(msg);
    await alicePage.keyboard.press("Enter");

    const sentBubble = alicePage.locator(".message-row.by-user .message").filter({ hasText: msg });
    await expect(sentBubble).toBeVisible({ timeout: 5_000 });
    await alicePage.waitForTimeout(3000);

    await alicePage.goto("/messages");

    const chatLink = alicePage.locator(`a[href="/messages/${bobPubkey}"]`);
    await expect(chatLink).toBeVisible({ timeout: 15_000 });

    const preview = chatLink.locator(".truncate");
    await expect(preview).toContainText(msg, { timeout: 10_000 });

    await aliceCtx.close();
  });
});
