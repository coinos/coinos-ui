import { Buffer } from "buffer";
import { browser } from "$app/environment";
import {
	decrypted,
	password as pw,
	passwordPrompt,
	signaturePrompt,
} from "$lib/store";
import { post, wait } from "$lib/utils";
import {
	type EventTemplate,
	finalizeEvent,
	getPublicKey,
	nip04,
	nip19,
} from "nostr-tools";
import { get } from "svelte/store";

import {
	decrypt as nip49decrypt,
	encrypt as nip49encrypt,
} from "nostr-tools/nip49";

import { bech32m } from "@scure/base";

type User = {
	[key: string]: any;
};

type EncryptParams = {
	message: string;
	recipient: string;
	user: User;
};

export const encrypt = async ({ message, recipient, user }: EncryptParams) => {
	const sk = await getPrivateKey(user);
	return nip04.encrypt(sk, recipient, message);
};

export const decrypt = async ({ event, user }) => {
	const cache = get(decrypted);
	try {
		let { content, pubkey, id } = event;
		if (cache[id]) return cache[id];
		if (pubkey === user.pubkey) pubkey = event.tags[0][1];

		const message = await nip04.decrypt(
			await getPrivateKey(user),
			pubkey,
			content,
		);

		cache[id] = Buffer.from(message).toString("utf8");
		decrypted.set(cache);

		return cache[id];
	} catch (e) {
		// console.log(e);
	}
};

export const getPrivateKey = async (user: User): Promise<Uint8Array> => {
	let k;
	if (browser) {
		k = localStorage.getItem("nsec");
		if (k) {
			return nip19.decode(k).data as Uint8Array;
		}
	}

	const { nsec } = user;

	if (nsec) {
		k = nip49decrypt(nsec, await getPassword());
	} else {
		throw new Error("nsec not available");
	}

	localStorage.setItem("nsec", nip19.nsecEncode(k));
	return k;
};

const decodeNsec = (nsec: string): Uint8Array => {
	const { type, data } = nip19.decode(nsec);
	if (type === "nsec" && data instanceof Uint8Array) return data;
	throw new Error("invalid nsec");
};

export const getNsec = async (user: User) => {
	return nip19.nsecEncode(await getPrivateKey(user));
};

export const setNsec = async (user: User, nsec: string) => {
	user.pubkey = getPublicKey(decodeNsec(nsec));
	user.nsec = await encryptNsec(nsec);
};

export const encryptNsec = async (nsec: string) => {
	const d = decodeNsec(nsec);
	return nip49encrypt(d, await getPassword());
};

type SignParams = {
	event: EventTemplate;
	user: User;
};

export const sign = async ({ event, user }: SignParams) => {
	let sk;
	if (user.nsec) {
		sk = await getPrivateKey(user);
		event = finalizeEvent(event, sk);
	} else {
		signaturePrompt.set(event);
	}
};

export const send = (event: EventTemplate) => {
	return post("/events", { event });
};

const getPassword = async (): Promise<string> => {
	if (!get(pw)) passwordPrompt.set(true);
	await wait(() => !!get(pw));
	return get(pw) || "";
};
