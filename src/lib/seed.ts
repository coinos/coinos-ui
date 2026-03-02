import { getWalletEntropy } from "$lib/walletEntropy";
import { signer } from "$lib/store";

export async function deriveNostrKey(entropy: ArrayBuffer) {
  const [{ entropyToMnemonic }, { wordlist }, { privateKeyFromSeedWords }, { getPublicKey }] =
    await Promise.all([
      import("@scure/bip39"),
      import("@scure/bip39/wordlists/english.js"),
      import("nostr-tools/nip06"),
      import("nostr-tools"),
    ]);

  const ent = new Uint8Array(entropy).slice(0, 16);
  const mnemonic = entropyToMnemonic(ent, wordlist);
  const sk = privateKeyFromSeedWords(mnemonic);
  const pubkey = getPublicKey(sk);
  return { sk, pubkey };
}

export async function autoUnlockNostr(userPubkey: string) {
  if (localStorage.getItem("nsec")) return;

  const entropy = await getWalletEntropy();
  if (!entropy) return;

  try {
    const { sk, pubkey } = await deriveNostrKey(entropy);
    if (pubkey !== userPubkey) return;

    const { nip19 } = await import("nostr-tools");
    const { bytesToHex } = await import("@noble/hashes/utils.js");
    localStorage.setItem("nsec", nip19.nsecEncode(sk));
    signer.set({
      method: "nsec",
      params: { sk: bytesToHex(sk), pk: pubkey },
      ready: true,
    });
  } catch (e) {
    console.error("Nostr auto-unlock failed:", e);
  }
}
