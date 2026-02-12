import { describe, it, expect } from "bun:test";
import { HDKey } from "@scure/bip32";
import {
  generateMnemonic,
  mnemonicToSeed,
  mnemonicToEntropy,
  entropyToMnemonic,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { encrypt, decrypt } from "nostr-tools/nip49";

const versions = {
  private: 0x04358394,
  public: 0x043587cf,
};

const password = "testpassword123";

describe("unified master seed", () => {
  const mnemonic = generateMnemonic(wordlist);

  it("generates a valid 12-word mnemonic", () => {
    const words = mnemonic.split(" ");
    expect(words.length).toBe(12);
    expect(validateMnemonic(mnemonic, wordlist)).toBe(true);
  });

  it("encrypts and decrypts entropy round-trip via NIP-49", async () => {
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    const encrypted = await encrypt(entropy, password);
    expect(typeof encrypted).toBe("string");
    expect(encrypted.startsWith("ncryptsec")).toBe(true);

    const decrypted = await decrypt(encrypted, password);
    const recovered = entropyToMnemonic(decrypted, wordlist);
    expect(recovered).toBe(mnemonic);
  });

  it("derives Bitcoin account at m/84'/0'/0'", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);
    const child = master.derive("m/84'/0'/0'");

    expect(child.publicExtendedKey).toBeTruthy();
    expect(child.publicExtendedKey.startsWith("tpub")).toBe(true);
    expect(child.privateKey).toBeTruthy();
    expect(child.fingerprint).toBeGreaterThan(0);
  });

  it("derives Ark key at m/86'/0'/0'/0/0", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);
    const arkChild = master.derive("m/86'/0'/0'/0/0");

    expect(arkChild.privateKey).toBeTruthy();
    expect(arkChild.privateKey!.length).toBe(32);

    const arkHex = bytesToHex(arkChild.privateKey!);
    expect(arkHex.length).toBe(64);
  });

  it("derives deterministic keys from the same seed", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master1 = HDKey.fromMasterSeed(seed, versions);
    const master2 = HDKey.fromMasterSeed(seed, versions);

    const btc1 = master1.derive("m/84'/0'/0'");
    const btc2 = master2.derive("m/84'/0'/0'");
    expect(btc1.publicExtendedKey).toBe(btc2.publicExtendedKey);

    const ark1 = master1.derive("m/86'/0'/0'/0/0");
    const ark2 = master2.derive("m/86'/0'/0'/0/0");
    expect(bytesToHex(ark1.privateKey!)).toBe(bytesToHex(ark2.privateKey!));
  });

  it("derives different keys for different Bitcoin account indices", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);

    const child0 = master.derive("m/84'/0'/0'");
    const child1 = master.derive("m/84'/0'/1'");
    const child2 = master.derive("m/84'/0'/2'");

    expect(child0.publicExtendedKey).not.toBe(child1.publicExtendedKey);
    expect(child1.publicExtendedKey).not.toBe(child2.publicExtendedKey);
    expect(child0.publicExtendedKey).not.toBe(child2.publicExtendedKey);
  });

  it("Bitcoin and Ark paths produce different keys", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);

    const btcChild = master.derive("m/84'/0'/0'");
    const arkChild = master.derive("m/86'/0'/0'/0/0");

    expect(bytesToHex(btcChild.privateKey!)).not.toBe(bytesToHex(arkChild.privateKey!));
  });
});

describe("full encrypt-derive-sign flow", () => {
  const mnemonic = generateMnemonic(wordlist);

  it("simulates the complete unified seed flow", async () => {
    // 1. User generates mnemonic and encrypts it as user.seed
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    const userSeed = await encrypt(entropy, password);

    // 2. Derive Bitcoin account (what pass page does)
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);
    const btcChild = master.derive("m/84'/0'/0'");
    const pubkey = btcChild.publicExtendedKey;
    const fingerprint = btcChild.fingerprint.toString(16).padStart(8, "0");

    expect(pubkey).toBeTruthy();
    expect(fingerprint.length).toBe(8);

    // 3. Later: decrypt user.seed to sign a transaction (what signTx does)
    const decryptedEntropy = await decrypt(userSeed, password);
    const recoveredMnemonic = entropyToMnemonic(decryptedEntropy, wordlist);
    const recoveredSeed = await mnemonicToSeed(recoveredMnemonic, password);
    const recoveredMaster = HDKey.fromMasterSeed(recoveredSeed, versions);
    const recoveredChild = recoveredMaster.derive("m/84'/0'/0'");

    expect(recoveredChild.publicExtendedKey).toBe(pubkey);
    expect(bytesToHex(recoveredChild.privateKey!)).toBe(bytesToHex(btcChild.privateKey!));
  });

  it("simulates Ark unlock from user.seed", async () => {
    // 1. Encrypt mnemonic as user.seed
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    const userSeed = await encrypt(entropy, password);

    // 2. Original Ark key derivation (during account creation)
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);
    const arkChild = master.derive("m/86'/0'/0'/0/0");
    const originalArkKey = bytesToHex(arkChild.privateKey!);

    // 3. Later: unlock Ark from user.seed (what tryUnlockArk does)
    const decryptedEntropy = await decrypt(userSeed, password);
    const recoveredMnemonic = entropyToMnemonic(decryptedEntropy, wordlist);
    const recoveredSeed = await mnemonicToSeed(recoveredMnemonic, password);
    const recoveredMaster = HDKey.fromMasterSeed(recoveredSeed, versions);
    const recoveredArkChild = recoveredMaster.derive("m/86'/0'/0'/0/0");
    const recoveredArkKey = bytesToHex(recoveredArkChild.privateKey!);

    expect(recoveredArkKey).toBe(originalArkKey);
  });

  it("dynamic accountIndex path works correctly", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);

    // Simulate what signTx does with accountIndex
    const accountIndex = 0;
    const child = master.derive(`m/84'/0'/${accountIndex}'`);

    // Should match the hardcoded path
    const hardcoded = master.derive("m/84'/0'/0'");
    expect(child.publicExtendedKey).toBe(hardcoded.publicExtendedKey);

    // accountIndex 1 should differ
    const child1 = master.derive(`m/84'/0'/${1}'`);
    expect(child1.publicExtendedKey).not.toBe(child.publicExtendedKey);
  });

  it("undefined accountIndex defaults to 0", async () => {
    const seed = await mnemonicToSeed(mnemonic, password);
    const master = HDKey.fromMasterSeed(seed, versions);

    // Simulates the ?? 0 fallback in signTx
    const accountIndex = undefined;
    const child = master.derive(`m/84'/0'/${accountIndex ?? 0}'`);
    const expected = master.derive("m/84'/0'/0'");

    expect(child.publicExtendedKey).toBe(expected.publicExtendedKey);
  });
});

describe("backward compatibility", () => {
  it("legacy per-account seed (raw hex) decrypts differently than mnemonic entropy", async () => {
    // Legacy: encrypt raw 32-byte hex key
    const rawKey = hexToBytes("deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
    const legacySeed = await encrypt(rawKey, password);

    // Decrypt legacy seed — get raw bytes back
    const decrypted = await decrypt(legacySeed, password);
    expect(bytesToHex(decrypted)).toBe(
      "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    );

    // Master seed: encrypt mnemonic entropy (16 bytes for 12 words)
    const mnemonic = generateMnemonic(wordlist);
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    const masterSeed = await encrypt(entropy, password);

    // Decrypt master seed — get entropy back, convert to mnemonic
    const decryptedEntropy = await decrypt(masterSeed, password);
    const recovered = entropyToMnemonic(decryptedEntropy, wordlist);
    expect(recovered).toBe(mnemonic);
  });

  it("NIP-49 encrypted strings start with ncryptsec", async () => {
    const data = new Uint8Array(32);
    const encrypted = await encrypt(data, password);
    expect(encrypted.startsWith("ncryptsec")).toBe(true);
  });

  it("wrong password fails to decrypt", async () => {
    const mnemonic = generateMnemonic(wordlist);
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    const encrypted = await encrypt(entropy, password);

    expect(() => decrypt(encrypted, "wrongpassword")).toThrow();
  });
});
