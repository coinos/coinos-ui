import { expect, test } from "@playwright/test";
import { login, bobUsername, bobPassword, aliceUsername, alicePassword, apiBaseUrl } from "./helpers";

test("MLS key package generation and group lifecycle in browser", async ({ browser }) => {
  test.setTimeout(60_000);

  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();

  const consoleLogs: string[] = [];
  bobPage.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  const pageErrors: string[] = [];
  bobPage.on("pageerror", (err) => pageErrors.push(err.message));

  await login(bobPage, bobUsername, bobPassword);

  // Resolve pubkeys
  const [bobRes, aliceRes] = await Promise.all([
    bobPage.request.get(`${apiBaseUrl}/users/${bobUsername}`),
    bobPage.request.get(`${apiBaseUrl}/users/${aliceUsername}`),
  ]);
  const bobPubkey = (await bobRes.json()).pubkey;
  const alicePubkey = (await aliceRes.json()).pubkey;
  expect(bobPubkey).toBeTruthy();
  expect(alicePubkey).toBeTruthy();

  // Navigate to any page so we have a DOM context for browser APIs
  await bobPage.goto(`/messages/${alicePubkey}`);
  await bobPage.waitForLoadState("domcontentloaded");

  // Test 1: ts-mls loads and ciphersuite initializes in browser
  const csTest = await bobPage.evaluate(async () => {
    try {
      const { getCS } = await import("/src/lib/mls.ts");
      const cs = await getCS();
      return {
        ok: true,
        hasHash: !!cs.hash,
        hasHpke: !!cs.hpke,
        hasSignature: !!cs.signature,
        hasKdf: !!cs.kdf,
      };
    } catch (e: any) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  });

  console.log("[e2e] Ciphersuite init:", JSON.stringify(csTest));
  expect(csTest.ok, `Ciphersuite init failed: ${(csTest as any).error}`).toBe(true);
  expect((csTest as any).hasHash).toBe(true);
  expect((csTest as any).hasHpke).toBe(true);
  expect((csTest as any).hasSignature).toBe(true);

  // Test 2: Generate key package with nostr pubkey credential
  const kpTest = await bobPage.evaluate(async (pubkey) => {
    try {
      const { generateMlsKeyPackage } = await import("/src/lib/mls.ts");
      const kp = await generateMlsKeyPackage(pubkey);
      return {
        ok: true,
        hasPublic: !!kp.publicPackage,
        hasPrivate: !!kp.privatePackage,
        version: kp.publicPackage.version,
        ciphersuite: kp.publicPackage.cipherSuite,
        credentialType: kp.publicPackage.leafNode.credential.credentialType,
        identityLength: kp.publicPackage.leafNode.credential.identity?.length,
      };
    } catch (e: any) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  }, bobPubkey);

  console.log("[e2e] Key package generation:", JSON.stringify(kpTest));
  expect(kpTest.ok, `Key package generation failed: ${(kpTest as any).error}`).toBe(true);
  expect((kpTest as any).hasPublic).toBe(true);
  expect((kpTest as any).hasPrivate).toBe(true);
  expect((kpTest as any).credentialType).toBe("basic");
  expect((kpTest as any).identityLength).toBe(32);

  // Test 3: Create group, add member, send and decrypt message — full lifecycle
  const lifecycleTest = await bobPage.evaluate(async ({ bobPubkey, alicePubkey }) => {
    try {
      const {
        generateMlsKeyPackage,
        createMlsGroup,
        addMember,
        joinMlsGroup,
        encryptMessage,
        decryptMessage,
        mip03Encrypt,
        mip03Decrypt,
      } = await import("/src/lib/mls.ts");

      // Generate key packages for both
      const bobKP = await generateMlsKeyPackage(bobPubkey);
      const aliceKP = await generateMlsKeyPackage(alicePubkey);

      // Bob creates group
      const group = await createMlsGroup(bobPubkey, {
        name: "e2e-test",
        description: "E2E test group",
        relays: ["ws://localhost:7777"],
        adminPubkeys: [bobPubkey],
      });

      // Bob adds Alice
      const { welcome, group: updatedGroup } = await addMember(group, aliceKP.publicPackage);

      // Alice joins via welcome
      const aliceGroup = await joinMlsGroup(welcome, aliceKP.publicPackage, aliceKP.privatePackage);

      // Verify both are in same group
      const sameGroup = updatedGroup.groupId === aliceGroup.groupId;

      // Bob sends a message
      const testMsg = "Hello from MLS e2e test!";
      const { mlsBytes, group: bobAfterSend } = await encryptMessage(updatedGroup, testMsg, bobPubkey);

      // Alice decrypts it
      const { plaintext, group: aliceAfterRecv } = await decryptMessage(aliceGroup, mlsBytes);

      // Test MIP-03 wrapping (ChaCha20-Poly1305)
      // Use the marmotKey from the group (already derived), or derive from state
      const marmotKey = updatedGroup.marmotKey;
      const wrapped = mip03Encrypt(mlsBytes, marmotKey);
      const unwrapped = mip03Decrypt(wrapped, marmotKey);
      const mip03Match = unwrapped.length === mlsBytes.length &&
        unwrapped.every((b: number, i: number) => b === mlsBytes[i]);

      return {
        ok: true,
        groupId: updatedGroup.groupId,
        sameGroup,
        plaintext,
        messageMatch: plaintext === testMsg,
        mip03Match,
        marmotKeyLength: marmotKey.length,
        groupIdLength: updatedGroup.groupId.length,
      };
    } catch (e: any) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  }, { bobPubkey, alicePubkey });

  console.log("[e2e] Full lifecycle:", JSON.stringify(lifecycleTest));
  expect(lifecycleTest.ok, `Lifecycle failed: ${(lifecycleTest as any).error}\n${(lifecycleTest as any).stack}`).toBe(true);
  expect((lifecycleTest as any).sameGroup).toBe(true);
  expect((lifecycleTest as any).messageMatch).toBe(true);
  expect((lifecycleTest as any).mip03Match).toBe(true);
  expect((lifecycleTest as any).marmotKeyLength).toBe(32);

  // Test 4: IndexedDB persistence — save and reload group
  const persistTest = await bobPage.evaluate(async (groupId) => {
    try {
      const { loadGroup, listGroups } = await import("/src/lib/mls.ts");
      const groups = await listGroups();
      const hasGroup = groups.includes(groupId);
      const loaded = await loadGroup(groupId);
      return {
        ok: true,
        groupCount: groups.length,
        hasGroup,
        loadedOk: loaded !== null,
        loadedGroupId: loaded?.groupId,
      };
    } catch (e: any) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  }, (lifecycleTest as any).groupId);

  console.log("[e2e] IndexedDB persistence:", JSON.stringify(persistTest));
  expect(persistTest.ok, `Persistence failed: ${(persistTest as any).error}`).toBe(true);
  expect((persistTest as any).hasGroup).toBe(true);
  expect((persistTest as any).loadedOk).toBe(true);

  // Test 5: Nostr event building (kind 443, 444, 445)
  const eventTest = await bobPage.evaluate(async ({ bobPubkey, alicePubkey }) => {
    try {
      const {
        generateMlsKeyPackage,
        createMlsGroup,
        addMember,
        encryptMessage,
        buildKeyPackageEvent,
        buildWelcomeEvent,
        buildGroupMessageEvent,
      } = await import("/src/lib/mls.ts");

      const bobKP = await generateMlsKeyPackage(bobPubkey);
      const aliceKP = await generateMlsKeyPackage(alicePubkey);
      const group = await createMlsGroup(bobPubkey);
      const { welcome, group: g2 } = await addMember(group, aliceKP.publicPackage);
      const { mlsBytes } = await encryptMessage(g2, "event test", bobPubkey);

      // Build kind 443
      const kpEvent = buildKeyPackageEvent(bobKP.publicPackage, bobPubkey, ["ws://localhost:7777"]);

      // Build kind 444
      const welcomeEvent = buildWelcomeEvent(welcome, "deadbeef".repeat(8), bobPubkey, ["ws://localhost:7777"]);

      // Build kind 445 (self-signing with ephemeral key)
      const msgEvent = buildGroupMessageEvent(mlsBytes, g2.marmotKey, g2.groupId);

      return {
        ok: true,
        kp443: { kind: kpEvent.kind, hasContent: !!kpEvent.content, hasTags: kpEvent.tags.length > 0 },
        welcome444: { kind: welcomeEvent.kind, hasContent: !!welcomeEvent.content, hasE: welcomeEvent.tags.some((t: any) => t[0] === "e") },
        msg445: { kind: msgEvent.kind, hasContent: !!msgEvent.content, hasH: msgEvent.tags.some((t: any) => t[0] === "h"), hasSig: !!msgEvent.sig },
      };
    } catch (e: any) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  }, { bobPubkey, alicePubkey });

  console.log("[e2e] Event building:", JSON.stringify(eventTest));
  expect(eventTest.ok, `Event building failed: ${(eventTest as any).error}`).toBe(true);
  expect((eventTest as any).kp443.kind).toBe(443);
  expect((eventTest as any).welcome444.kind).toBe(444);
  expect((eventTest as any).welcome444.hasE).toBe(true);
  expect((eventTest as any).msg445.kind).toBe(445);
  expect((eventTest as any).msg445.hasH).toBe(true);
  expect((eventTest as any).msg445.hasSig).toBe(true);

  // Report any page errors
  if (pageErrors.length) {
    console.log("[e2e] Page errors:", pageErrors);
  }

  const errors = consoleLogs.filter((l) => /error|fail/i.test(l));
  if (errors.length) {
    console.log("[e2e] Console errors:\n  " + errors.join("\n  "));
  }

  await bobContext.close();
});
