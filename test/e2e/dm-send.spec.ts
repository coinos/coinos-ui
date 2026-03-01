import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword, aliceUsername } from "./helpers";

test("bob sends a DM to alice via /dm page", async ({ browser }) => {
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

  // Navigate to /dm selecting alice
  await bobPage.goto(`/dm?username=${aliceUsername}`);
  await bobPage.waitForLoadState("domcontentloaded");

  // Wait for the message textarea (indicates a chat is selected)
  const textarea = bobPage.locator("#message-contents");
  await expect(textarea).toBeVisible({ timeout: 15_000 });

  // Verify send button is enabled (depends on relay availability)
  const sendButton = bobPage.locator("#send-message");
  await expect(sendButton).toBeVisible({ timeout: 5_000 });
  const isDisabled = await sendButton.isDisabled();
  const buttonValue = await sendButton.getAttribute("value");
  console.log(`[e2e] Send button disabled=${isDisabled}, value="${buttonValue}"`);
  expect(isDisabled, `Send button is disabled: "${buttonValue}"`).toBeFalsy();

  // Verify the Nostr sign modal does NOT appear (ensureSigner should use nsec from localStorage)
  const signerModal = bobPage.locator("text=Nostr sign");
  const modalBefore = await signerModal.isVisible({ timeout: 500 }).catch(() => false);
  expect(modalBefore, "Nostr sign modal should not appear before send").toBeFalsy();

  // Type and send a test message
  const testMessage = `e2e test message ${Date.now()}`;
  await textarea.fill(testMessage);
  await sendButton.click();

  // Wait for the send to complete — textarea clears on success
  await expect(textarea).toHaveValue("", { timeout: 15_000 });

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

  // Verify the relay accepted both gift-wrapped events (one for recipient, one for sender copy)
  const relayAccepts = wsMessages.filter((m) => m.startsWith("recv:") && m.includes('"OK"') && m.includes(",true,"));
  console.log(`[e2e] Relay accepted ${relayAccepts.length} event(s)`);
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
