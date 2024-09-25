import { browser } from "$app/environment";
import { hexToUint8Array } from "uint8array-extras";
import { get } from "svelte/store";
import { Buffer } from "buffer";
import { wait, post, stretch } from "$lib/utils";
import { decrypted, password as pw, passwordPrompt, pin } from "$lib/store";
import {
  getPublicKey,
  finalizeEvent,
  nip04,
  nip19,
  type EventTemplate,
} from "nostr-tools";

import {
  encrypt as nip49encrypt,
  decrypt as nip49decrypt,
} from "nostr-tools/nip49";

import { mnemonicToEntropy, entropyToMnemonic } from "@scure/bip39";
import { bech32m } from "@scure/base";
import { wordlist } from "@scure/bip39/wordlists/english";

import { generateSeedWords, privateKeyFromSeedWords } from "nostr-tools/nip06";

type User = {
  [key: string]: any;
};

type EncryptParams = {
  message: string;
  recipient: string;
  user: User;
};

const { encode, decode, toWords, fromWords } = bech32m;

export let generate = async (user: any) => {
  let p = get(pin);
  if (p && p.length !== 6) return;

  let salt = crypto.getRandomValues(new Uint8Array(16));
  let mnemonic = generateSeedWords();
  let sk = privateKeyFromSeedWords(mnemonic);

  let bytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(await getPassword(), salt),
      mnemonicToEntropy(mnemonic, wordlist)
    )
  );

  user.pubkey = getPublicKey(hexToUint8Array(sk));
  user.cipher = encode("en", toWords(bytes), 180);
  user.salt = Buffer.from(salt).toString("hex");
};

export let encrypt = async ({ message, recipient, user }: EncryptParams) => {
  let sk = await getPrivateKey(user);
  return nip04.encrypt(sk, recipient, message);
};

export let decrypt = async ({ event, user }) => {
  let cache = get(decrypted);
  try {
    let { content, pubkey, id } = event;
    if (cache[id]) return cache[id];
    if (pubkey === user.pubkey) pubkey = event.tags[0][1];

    let message = await nip04.decrypt(
      await getPrivateKey(user),
      pubkey,
      content
    );

    cache[id] = Buffer.from(message).toString("utf8");
    decrypted.set(cache);

    return cache[id];
  } catch (e) {
    // console.log(e);
  }
};

export let getPrivateKey = async (user: User): Promise<Uint8Array> => {
  let k;
  if (browser) {
    k = localStorage.getItem("nsec");
    if (k) {
      return nip19.decode(k).data as Uint8Array;
    }
  }

  let { nsec } = user;

  if (nsec) {
    k = nip49decrypt(nsec, await getPassword());
  } else k = hexToUint8Array(privateKeyFromSeedWords(await getMnemonic(user)));

  localStorage.setItem("nsec", nip19.nsecEncode(k));
  return k;
};

export let getMnemonic = async (user: User) => {
  let { cipher, salt } = user;
  let entropy;

  entropy = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(await getPassword(), Buffer.from(salt, "hex")),
      Uint8Array.from(fromWords(decode(cipher, 180).words))
    )
  );

  return entropyToMnemonic(entropy, wordlist);
};

let decodeNsec = (nsec: string): Uint8Array => {
  let { type, data } = nip19.decode(nsec);
  if (type === "nsec" && data instanceof Uint8Array) return data;
  else throw new Error("invalid nsec");
};

export let getNsec = async (user: User) => {
  return nip19.nsecEncode(await getPrivateKey(user));
};

export let setNsec = async (user: User, nsec: string) => {
  user.pubkey = getPublicKey(decodeNsec(nsec));
  user.nsec = await encryptNsec(nsec);
};

export let encryptNsec = async (nsec: string) => {
  let d = decodeNsec(nsec);
  return nip49encrypt(d, await getPassword());
};

type SignParams = {
  event: EventTemplate;
  user: User;
};

export let sign = async ({ event, user }: SignParams) => {
  event = finalizeEvent(event, await getPrivateKey(user));
};

export let send = (event: EventTemplate) => {
  return post("/events", { event });
};

let getPassword = async (): Promise<string> => {
  if (!get(pw)) passwordPrompt.set(true);
  await wait(() => !!get(pw));
  return get(pw) || "";
};

export let reEncryptEntropy = async (user: User, newPassword: string) => {
  let { cipher, salt } = user;

  let entropy = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(16) },
    await stretch(await getPassword(), hexToUint8Array(salt)),
    Uint8Array.from(fromWords(decode(cipher, 180).words))
  );

  let bytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(newPassword, hexToUint8Array(salt)),
      entropy
    )
  );

  return encode("en", toWords(bytes), 180);
};
