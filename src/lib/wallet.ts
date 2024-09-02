import { getMnemonic } from "$lib/nostr";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeed } from "@scure/bip39";

export let xpub = async (user) => {
  let mnemonic = await getMnemonic(user);
  let seed = await mnemonicToSeed(mnemonic);
  const hdkey1 = HDKey.fromMasterSeed(seed);
  console.log("HD", hdkey1);
};
