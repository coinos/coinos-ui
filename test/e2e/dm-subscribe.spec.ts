import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword, aliceUsername, alicePassword } from "./helpers";

test("recipient receives DM via relay subscription in real-time", async ({ browser }) => {
  test.setTimeout(60_000);

  // --- Set up Alice (recipient) ---
  const aliceContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();

  const aliceConsole: string[] = [];
  alicePage.on("console", (msg) => aliceConsole.push(`[${msg.type()}] ${msg.text()}`));

  // Track WebSocket frames on Alice's relay connections
  const aliceWsFrames: { url: string; dir: string; text: string; time: number }[] = [];
  alicePage.on("websocket", (ws) => {
    const url = ws.url();
    console.log(`[alice-ws] connected: ${url}`);
    ws.on("framesent", (frame) => {
      aliceWsFrames.push({ url, dir: "sent", text: frame.payload.toString(), time: Date.now() });
    });
    ws.on("framereceived", (frame) => {
      aliceWsFrames.push({ url, dir: "recv", text: frame.payload.toString(), time: Date.now() });
    });
  });

  await login(alicePage, aliceUsername, alicePassword);
  await alicePage.goto(`/dm?username=${bobUsername}`);
  await alicePage.waitForLoadState("domcontentloaded");

  const aliceTextarea = alicePage.locator("#message-contents");
  await expect(aliceTextarea).toBeVisible({ timeout: 15_000 });

  // Wait for subscription to be fully established (EOSE received)
  await alicePage.waitForTimeout(3_000);

  // Verify subscription REQ was sent correctly (NOT double-nested)
  const subReqs = aliceWsFrames.filter(
    (f) => f.dir === "sent" && f.text.includes('"REQ"') && f.text.includes("1059") && f.text.includes('"since"'),
  );
  console.log(`[alice] Subscription REQs: ${subReqs.length}`);
  for (const req of subReqs) {
    console.log(`[alice]   ${req.url}: ${req.text.slice(0, 200)}`);
    // Verify filter is NOT double-nested (the bug was [[{...}]] instead of [{...}])
    const parsed = JSON.parse(req.text);
    // REQ format: ["REQ", subId, filter1, filter2, ...]
    // Filter should be an object, not an array
    expect(typeof parsed[2], "Filter should be an object, not double-nested array").toBe("object");
    expect(Array.isArray(parsed[2]), "Filter should not be an array").toBeFalsy();
  }
  expect(subReqs.length, "Should have at least one subscription REQ").toBeGreaterThanOrEqual(1);

  // Verify EOSE was received for the subscription
  const subEoses = aliceWsFrames.filter(
    (f) => f.dir === "recv" && f.text.includes('"EOSE"'),
  );
  console.log(`[alice] EOSE messages: ${subEoses.length}`);
  expect(subEoses.length, "Should have received EOSE").toBeGreaterThanOrEqual(1);

  // Record the timestamp before Bob sends
  const beforeSend = Date.now();

  // --- Set up Bob (sender) ---
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  const bobWsFrames: string[] = [];
  bobPage.on("websocket", (ws) => {
    ws.on("framereceived", (frame) => bobWsFrames.push(frame.payload.toString()));
  });

  await login(bobPage, bobUsername, bobPassword);
  await bobPage.goto(`/dm?username=${aliceUsername}`);
  await bobPage.waitForLoadState("domcontentloaded");

  const bobTextarea = bobPage.locator("#message-contents");
  await expect(bobTextarea).toBeVisible({ timeout: 15_000 });

  const sendButton = bobPage.locator("#send-message");
  await expect(sendButton).toBeEnabled({ timeout: 5_000 });

  // --- Bob sends a message ---
  const testMessage = `realtime-test-${Date.now()}`;
  console.log(`[bob] Sending: ${testMessage}`);
  await bobTextarea.fill(testMessage);
  await sendButton.click();
  await expect(bobTextarea).toHaveValue("", { timeout: 15_000 });
  console.log("[bob] Message sent");

  // Verify Bob's relay accepted the events
  const bobAccepts = bobWsFrames.filter((m) => m.includes('"OK"') && m.includes(",true,"));
  console.log(`[bob] Relay accepted ${bobAccepts.length} events`);
  expect(bobAccepts.length, "Relay should accept at least 1 event").toBeGreaterThanOrEqual(1);

  // --- Check if Alice's subscription received the new event ---
  // Wait a few seconds for the relay to deliver the event to Alice
  await alicePage.waitForTimeout(5_000);

  // Look for new EVENT messages received by Alice AFTER Bob sent
  const newEvents = aliceWsFrames.filter(
    (f) =>
      f.dir === "recv" &&
      f.text.includes('"EVENT"') &&
      f.time > beforeSend,
  );
  console.log(`[alice] New EVENT frames received after Bob sent: ${newEvents.length}`);
  for (const ev of newEvents) {
    console.log(`[alice]   ${ev.url}: ${ev.text.slice(0, 200)}`);
  }

  // Check specifically for kind 1059 events (gift wraps)
  const newGiftWraps = newEvents.filter((f) => {
    try {
      const parsed = JSON.parse(f.text);
      return parsed[2]?.kind === 1059;
    } catch {
      return false;
    }
  });
  console.log(`[alice] New kind-1059 gift wraps received: ${newGiftWraps.length}`);

  // The subscription should deliver at least one new gift-wrapped event
  expect(
    newGiftWraps.length,
    "Alice's subscription should receive Bob's gift-wrapped message from the relay",
  ).toBeGreaterThanOrEqual(1);

  // Log any decrypt attempts from subscription handler
  const subDecryptLogs = aliceConsole.filter(
    (l) => l.includes("subscription event"),
  );
  if (subDecryptLogs.length) {
    console.log("[alice] Subscription decrypt attempts:");
    for (const l of subDecryptLogs) console.log(`[alice]   ${l}`);
  }

  await bobContext.close();
  await aliceContext.close();
});
