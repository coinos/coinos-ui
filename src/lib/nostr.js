import { get } from "svelte/store";
import { Buffer } from "buffer";
import { fail, wait, post, stretch } from "$lib/utils";
import {
  decrypted,
  password as pw,
  passwordPrompt,
  pin,
  loginRedirect,
} from "$lib/store";
import { goto, invalidate } from "$app/navigation";
import {
  getPublicKey,
  finalizeEvent,
  getEventHash,
  nip04,
  nip19,
} from "nostr-tools";

import {
  encrypt as nip49encrypt,
  decrypt as nip49decrypt,
} from "nostr-tools/nip49";

import { mnemonicToEntropy, entropyToMnemonic } from "@scure/bip39";
import wordlist from "$lib/english";
import { bech32m } from "@scure/base";

import { generateSeedWords, privateKeyFromSeedWords } from "nostr-tools/nip06";
const { encode, decode, toWords, fromWords } = bech32m;

export let generate = async (user) => {
  if (!get(pin)?.length === 6) return;

  let salt = crypto.getRandomValues(new Uint8Array(16));
  let mnemonic = generateSeedWords();
  let sk = privateKeyFromSeedWords(mnemonic);

  let bytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(await getPassword(), salt),
      Uint8Array.from(Buffer.from(mnemonicToEntropy(mnemonic, wordlist), "hex"))
    )
  );

  user.pubkey = getPublicKey(sk);
  user.cipher = encode("en", toWords(bytes), 180);
  user.salt = Buffer.from(salt).toString("hex");
};

export let encrypt = async ({ message, recipient, user }) => {
  return nip04.encrypt(await getPrivateKey(user), recipient, message);
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

function typedArrayToBuffer(array) {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset
  );
}

export let getPrivateKey = async (user) => {
  let { nsec, username, salt } = user;
  let privkey = privateKeyFromSeedWords(await getMnemonic(user));

  if (nsec) {
    let decrypted = nip49decrypt(nsec, await getPassword());
    return decrypted;
  } else return privkey;
};

export let getMnemonic = async (user) => {
  let { cipher, username, salt } = user;
  let mnemonic, key, seed, entropy, child, privkey;

  entropy = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(await getPassword(), Buffer.from(salt, "hex")),
      Uint8Array.from(fromWords(decode(cipher, 180).words))
    )
  );

  return entropyToMnemonic(entropy, wordlist);
};

export let getNsec = async (user) => {
  return nip19.nsecEncode(await getPrivateKey(user));
};

export let setNsec = async (user, nsec) => {
  let { data: sk } = nip19.decode(nsec);
  user.pubkey = getPublicKey(sk);
  user.nsec = await encryptNsec(nsec);
};

export let encryptNsec = async (nsec) => {
  let { type, data } = nip19.decode(nsec);
  if (type === "nsec" && data.length === 32) {
    return nip49encrypt(data, await getPassword());
  } else {
    fail("invalid nsec");
  }
};

export let sign = async ({ event, user }) => {
  event = finalizeEvent(event, await getPrivateKey(user));
};

export let send = (event) => {
  return post("/events", { event });
};

let getPassword = async () => {
  let password = get(pw);

  if (!password) passwordPrompt.set(true);
  else {
    try {
      await post("/password", { password });
    } catch (e) {
      passwordPrompt.set(true);
    }
  }

  await wait(() => !!get(pw));
  return get(pw);
};

export let reEncryptEntropy = async (user, newPassword) => {
  let { cipher, username, salt } = user;

  let mnemonic, key, seed, entropy, child, privkey;
  entropy = Buffer.from(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(await getPassword(), Buffer.from(salt, "hex")),
      Uint8Array.from(fromWords(decode(cipher, 180).words))
    ),
    "hex"
  ).toString("hex");

  let bytes = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(16) },
      await stretch(newPassword, Buffer.from(salt, "hex")),
      Uint8Array.from(Buffer.from(entropy, "hex"))
    )
  );

  return encode("en", toWords(bytes), 180);
};
