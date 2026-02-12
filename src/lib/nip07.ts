import { bytesToHex } from "@noble/hashes/utils.js";
import { finalizeEvent } from "nostr-tools/pure";
import { getPrivateKey } from "$lib/nostr";
import * as libnip44 from "$lib/nip44";
import { u } from "$lib/nip44";

// Signs an event using NIP-07 if available, otherwise getPrivateKey()
export const signEvent = async (event: any, user: any): Promise<any> => {
  if ((await (window as any).nostr.getPublicKey()) === user.pubkey) {
    return (window as any).nostr.signEvent(event);
  } else {
    const sk = await getPrivateKey(user);
    return finalizeEvent(event, sk);
  }
};

// Encrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const encrypt = async (json: any, user: any, receiverPK: string): Promise<string> => {
  if ((await (window as any).nostr.getPublicKey()) === user.pubkey) {
    return (window as any).nostr.nip44.encrypt(receiverPK, JSON.stringify(json));
  } else {
    const senderSK = await getPrivateKey(user);
    const senderSKString = bytesToHex(senderSK);
    const ckey = u.getConversationKey(senderSKString, receiverPK);
    return libnip44.encrypt(JSON.stringify(json), ckey);
  }
};

// Decrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const decrypt = async (encrypted: string, user: any, receiverPK: string): Promise<any> => {
  if ((await (window as any).nostr.getPublicKey()) === user.pubkey) {
    return JSON.parse(await (window as any).nostr.nip44.decrypt(receiverPK, encrypted));
  } else {
    const senderSK = await getPrivateKey(user);
    const senderSKString = bytesToHex(senderSK);
    const ckey = u.getConversationKey(senderSKString, receiverPK);
    return JSON.parse(libnip44.decrypt(encrypted, ckey));
  }
};
