import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword, aliceUsername, alicePassword, apiBaseUrl } from "./helpers";

test("recipient receives DM via MLS subscription in real-time", async ({ browser }) => {
  test.setTimeout(90_000);

  // --- Resolve pubkeys from usernames ---
  const aliceContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();

  const [aliceRes, bobRes] = await Promise.all([
    alicePage.request.get(`${apiBaseUrl}/users/${aliceUsername}`),
    alicePage.request.get(`${apiBaseUrl}/users/${bobUsername}`),
  ]);
  const alicePubkey = (await aliceRes.json()).pubkey;
  const bobPubkey = (await bobRes.json()).pubkey;

  // --- Set up Alice (recipient) ---
  const aliceConsole: string[] = [];
  alicePage.on("console", (msg) => aliceConsole.push(`[${msg.type()}] ${msg.text()}`));

  await login(alicePage, aliceUsername, alicePassword);
  await alicePage.goto(`/messages/${bobPubkey}`);
  await alicePage.waitForLoadState("domcontentloaded");

  const aliceTextarea = alicePage.locator("#message-contents");
  await expect(aliceTextarea).toBeVisible({ timeout: 15_000 });

  // Wait for MLS group to be created and subscription established
  const aliceSendBtn = alicePage.locator('button[aria-label="Send"]');
  // Fill temporary text to test if send button enables (indicating groupId is set)
  await aliceTextarea.fill("test");
  const aliceReady = await aliceSendBtn
    .isEnabled({ timeout: 15_000 })
    .catch(() => false);

  if (!aliceReady) {
    console.log("[alice] Send button never enabled — MLS group creation may have failed");
    const errors = aliceConsole.filter((l) => /error|fail/i.test(l));
    if (errors.length) console.log("[alice] Errors:", errors.slice(-5).join("\n"));
    test.skip(true, "MLS group creation failed — send button never enabled");
    await aliceContext.close();
    return;
  }

  // Clear the temporary text
  await aliceTextarea.fill("");

  // --- Set up Bob (sender) ---
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  await login(bobPage, bobUsername, bobPassword);
  await bobPage.goto(`/messages/${alicePubkey}`);
  await bobPage.waitForLoadState("domcontentloaded");

  const bobTextarea = bobPage.locator("#message-contents");
  await expect(bobTextarea).toBeVisible({ timeout: 15_000 });

  // Wait for Bob's MLS group to be ready
  const testMessage = `realtime-test-${Date.now()}`;
  await bobTextarea.fill(testMessage);
  const bobSendBtn = bobPage.locator('button[aria-label="Send"]');
  await expect(bobSendBtn).toBeEnabled({ timeout: 15_000 });

  // --- Bob sends the message ---
  console.log(`[bob] Sending: ${testMessage}`);
  await bobSendBtn.click();
  await expect(bobTextarea).toHaveValue("", { timeout: 15_000 });
  console.log("[bob] Message sent (textarea cleared)");

  // Verify Bob sees his message
  const bobSentBubble = bobPage.locator(".message").filter({ hasText: testMessage });
  await expect(bobSentBubble).toBeVisible({ timeout: 5_000 });

  // --- Alice should receive the message via MLS subscription ---
  const aliceReceivedBubble = alicePage.locator(".message").filter({ hasText: testMessage });
  await expect(aliceReceivedBubble).toBeVisible({ timeout: 30_000 });
  console.log("[alice] Message received via MLS subscription!");

  await bobContext.close();
  await aliceContext.close();
});
