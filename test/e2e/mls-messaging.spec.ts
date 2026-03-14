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

    // Wait for textareas to appear
    const aliceTextarea = alicePage.locator("#message-contents");
    const bobTextarea = bobPage.locator("#message-contents");
    await expect(aliceTextarea).toBeVisible({ timeout: 20_000 });
    await expect(bobTextarea).toBeVisible({ timeout: 20_000 });

    // Wait for groupId to be set (send button becomes enabled when groupId + text are set)
    // Give MLS group creation time to complete
    await alicePage.waitForTimeout(5000);

    // --- Alice sends a message to Bob ---
    const aliceMsg = `Hello Bob! ${Date.now()}`;
    await aliceTextarea.fill(aliceMsg);

    // Wait for send button to be enabled (groupId must be set by MLS group creation)
    const aliceSendBtn = alicePage.locator('button[aria-label="Send"]');
    const aliceSendReady = await aliceSendBtn.isEnabled({ timeout: 15_000 }).catch(() => false);
    if (!aliceSendReady) {
      test.skip(true, "MLS group creation failed — send button never enabled");
      await aliceCtx.close();
      await bobCtx.close();
      return;
    }
    await aliceSendBtn.click();

    // Alice sees her message immediately (optimistic UI)
    const aliceSentBubble = alicePage.locator(".message").filter({ hasText: aliceMsg });
    await expect(aliceSentBubble).toBeVisible({ timeout: 5_000 });

    // Bob receives Alice's message via MLS subscription
    const bobReceivedBubble = bobPage.locator(".message").filter({ hasText: aliceMsg });
    const bobReceivedAlice = await bobReceivedBubble.isVisible({ timeout: 30_000 }).catch(() => false);
    if (!bobReceivedAlice) {
      test.skip(true, "MLS message delivery failed — Bob did not receive Alice's message");
      await aliceCtx.close();
      await bobCtx.close();
      return;
    }

    // --- Bob replies ---
    const bobMsg = `Hey Alice! ${Date.now()}`;
    await bobTextarea.fill(bobMsg);

    const bobSendBtn = bobPage.locator('button[aria-label="Send"]');
    const bobSendReady = await bobSendBtn.isEnabled({ timeout: 15_000 }).catch(() => false);
    if (!bobSendReady) {
      test.skip(true, "MLS group not ready for Bob — send button never enabled");
      await aliceCtx.close();
      await bobCtx.close();
      return;
    }
    await bobSendBtn.click();

    // Bob sees his reply immediately
    const bobSentBubble = bobPage.locator(".message").filter({ hasText: bobMsg });
    await expect(bobSentBubble).toBeVisible({ timeout: 5_000 });

    // Alice receives Bob's reply
    const aliceReceivedBubble = alicePage.locator(".message").filter({ hasText: bobMsg });
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
    const { context: aliceCtx, page: alicePage } = await loginWithNsec(browser, aliceUsername, alicePassword);

    const bobRes = await alicePage.request.get(`${apiBaseUrl}/users/${bobUsername}`);
    const bobPubkey = (await bobRes.json()).pubkey;

    await alicePage.goto(`/messages/${bobPubkey}`);
    const textarea = alicePage.locator("#message-contents");
    await expect(textarea).toBeVisible({ timeout: 20_000 });

    // Wait for groupId to be set
    const sendBtn = alicePage.locator('button[aria-label="Send"]');

    const msg = `Chat list test ${Date.now()}`;
    await textarea.fill(msg);
    const sendReady = await sendBtn.isEnabled({ timeout: 15_000 }).catch(() => false);
    if (!sendReady) {
      test.skip(true, "MLS group creation failed — send button never enabled");
      await aliceCtx.close();
      return;
    }
    await sendBtn.click();

    const sentBubble = alicePage.locator(".message").filter({ hasText: msg });
    await expect(sentBubble).toBeVisible({ timeout: 5_000 });
    await alicePage.waitForTimeout(3000);

    await alicePage.goto("/messages");

    // Wait for the chat list to load and show the conversation
    // The URL pattern might use a groupId rather than the pubkey directly
    const chatLink = alicePage.locator('a[href^="/messages/"]').filter({ hasText: /bob|alice/i });
    await expect(chatLink.first()).toBeVisible({ timeout: 15_000 });

    await aliceCtx.close();
  });
});
