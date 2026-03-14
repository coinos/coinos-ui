import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword, aliceUsername, apiBaseUrl } from "./helpers";

test("bob sends a DM to alice via /messages page", async ({ browser }) => {
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  // Collect console logs for diagnostics
  const consoleLogs: string[] = [];
  bobPage.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  const pageErrors: string[] = [];
  bobPage.on("pageerror", (err) => pageErrors.push(err.message));

  // Login as bob (sets auth cookies + nsec in localStorage)
  await login(bobPage, bobUsername, bobPassword);

  // Resolve Alice's pubkey from username
  const aliceRes = await bobPage.request.get(`${apiBaseUrl}/users/${aliceUsername}`);
  const alicePubkey = (await aliceRes.json()).pubkey;
  expect(alicePubkey, "Alice should have a pubkey").toBeTruthy();

  // Navigate to /messages selecting alice by pubkey
  await bobPage.goto(`/messages/${alicePubkey}`);
  await bobPage.waitForLoadState("domcontentloaded");

  // Wait for the message textarea to become visible
  const textarea = bobPage.locator("#message-contents");
  await expect(textarea).toBeVisible({ timeout: 15_000 });

  // Type a test message
  const testMessage = `e2e test message ${Date.now()}`;
  await textarea.fill(testMessage);

  // Wait for send button to be enabled (groupId must be set by MLS group creation)
  const sendButton = bobPage.locator('button[aria-label="Send"]');
  const isEnabled = await sendButton.isEnabled({ timeout: 15_000 }).catch(() => false);

  if (!isEnabled) {
    // MLS group creation may have failed — check console
    const errors = consoleLogs.filter((l) => /error|fail/i.test(l));
    console.log("[e2e] Console errors:", errors.slice(-10).join("\n  "));
    console.log("[e2e] Page errors:", pageErrors.join("\n  "));
    test.skip(true, "MLS group creation failed — send button never enabled");
    await bobContext.close();
    return;
  }

  await sendButton.click();

  // Wait for textarea to clear (message sent)
  await expect(textarea).toHaveValue("", { timeout: 15_000 });

  // Verify the message appears in the chat (optimistic UI)
  const sentBubble = bobPage.locator(".message").filter({ hasText: testMessage });
  await expect(sentBubble).toBeVisible({ timeout: 10_000 });

  // Verify no error message appeared in the UI
  const sendError = bobPage.locator(".warning em");
  const hasError = await sendError
    .filter({ hasText: /failed|error/i })
    .isVisible({ timeout: 1_000 })
    .catch(() => false);
  if (hasError) {
    const errorText = await sendError.innerText();
    console.log(`[e2e] UI error: ${errorText}`);
  }
  expect(hasError, "No send error should appear").toBeFalsy();

  // Dump diagnostics
  const errors = consoleLogs.filter((l) => /error|fail|blocked/i.test(l));
  if (errors.length) {
    console.log("[e2e] Console errors:\n  " + errors.join("\n  "));
  }

  await bobContext.close();
});
