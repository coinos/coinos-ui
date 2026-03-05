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

  // Track relay WebSocket messages to verify publish
  const wsMessages: string[] = [];
  bobPage.on("websocket", (ws) => {
    ws.on("framesent", (frame) =>
      wsMessages.push(`sent: ${frame.payload.toString().slice(0, 200)}`),
    );
    ws.on("framereceived", (frame) =>
      wsMessages.push(`recv: ${frame.payload.toString().slice(0, 200)}`),
    );
  });

  // Login as bob (sets auth cookies + nsec in localStorage)
  await login(bobPage, bobUsername, bobPassword);

  // Resolve Alice's pubkey from username
  const aliceRes = await bobPage.request.get(`${apiBaseUrl}/users/${aliceUsername}`);
  const alicePubkey = (await aliceRes.json()).pubkey;
  expect(alicePubkey, "Alice should have a pubkey").toBeTruthy();

  // Navigate to /messages selecting alice by pubkey
  await bobPage.goto(`/messages/${alicePubkey}`);
  await bobPage.waitForLoadState("domcontentloaded");

  // Wait for the message textarea to become enabled (canSend=true after relay query completes)
  const textarea = bobPage.locator("#message-contents");
  await expect(textarea).toBeEnabled({ timeout: 15_000 });

  // Verify the Nostr sign modal does NOT appear (ensureSigner should use nsec from localStorage)
  const signerModal = bobPage.locator("text=Nostr sign");
  const modalBefore = await signerModal.isVisible({ timeout: 500 }).catch(() => false);
  expect(modalBefore, "Nostr sign modal should not appear before send").toBeFalsy();

  // Type and send a test message (button is disabled={!canSend || !text.trim()})
  const testMessage = `e2e test message ${Date.now()}`;
  await textarea.fill(testMessage);
  const sendButton = bobPage.locator('button[aria-label="Send"]');
  await expect(sendButton).toBeEnabled({ timeout: 5_000 });
  await sendButton.click();

  // Wait for the send to complete — textarea clears immediately, but relay publish is async.
  // Wait for relay OK messages to arrive (up to 15s).
  await expect(textarea).toHaveValue("", { timeout: 15_000 });

  // Wait for relay to accept at least 1 event (the publish is async after textarea clears)
  let relayAccepts: string[] = [];
  for (let i = 0; i < 30; i++) {
    relayAccepts = wsMessages.filter((m) => m.startsWith("recv:") && m.includes('"OK"') && m.includes(",true,"));
    if (relayAccepts.length > 0) break;
    await bobPage.waitForTimeout(500);
  }
  console.log(`[e2e] Relay accepted ${relayAccepts.length} event(s)`);

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

  expect(relayAccepts.length, "Relay should accept at least 1 gift-wrapped event").toBeGreaterThanOrEqual(1);

  // Verify no "blocked" or relay rejection
  const relayRejects = wsMessages.filter((m) => m.startsWith("recv:") && m.includes('"OK"') && m.includes(",false,"));
  if (relayRejects.length) {
    console.log("[e2e] Relay rejections:", relayRejects);
  }
  expect(relayRejects.length, "Relay should not reject any events").toBe(0);

  // Dump diagnostics
  const errors = consoleLogs.filter((l) => /error|fail|blocked/i.test(l));
  if (errors.length) {
    console.log("[e2e] Console errors:\n  " + errors.join("\n  "));
  }

  await bobContext.close();
});
