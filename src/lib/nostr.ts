import { Buffer } from "buffer";
import { browser } from "$app/environment";
import {
	decrypted,
	eventToSign,
	password as pw,
	passwordPrompt,
	signer as $signer,
} from "$lib/store";
import { post, wait } from "$lib/utils";
import {
	type EventTemplate,
	finalizeEvent,
	getEventHash,
	getPublicKey,
	nip04,
	nip19,
} from "nostr-tools";
import { Relay } from "nostr-tools/relay";
import { get } from "svelte/store";

import {
	decrypt as nip49decrypt,
	encrypt as nip49encrypt,
} from "nostr-tools/nip49";

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

export const sign = async (event) => {
	eventToSign.set(event);
	let unsubscribe;
	const { method, params } = await new Promise((r) => {
		unsubscribe = $signer.subscribe((v) => v?.ready && r(v));
	});
	await unsubscribe();
	const signedEvent = await signingMethods[method](event, params);
	eventToSign.set(signedEvent);
	setTimeout(() => eventToSign.set(null), 1000);
	return signedEvent;
};

export const send = (event: EventTemplate) => {
	return post("/events", { event });
};

const getPassword = async (): Promise<string> => {
	if (!get(pw)) passwordPrompt.set(true);
	await wait(() => !!get(pw));
	return get(pw) || "";
};

export const nostrConnectRelay = "wss://relay.nsec.app";

const signingMethods = {
	async connect(event, { sk, pk, pubkey }) {
		const id = crypto.randomUUID();
		const signEvent = {
			id,
			method: "sign_event",
			params: [JSON.stringify(event)],
		};

		const content = await nip04.encrypt(sk, pk, JSON.stringify(signEvent));

		const signedSignEvent = finalizeEvent(
			{
				created_at: Math.round(Date.now() / 1000),
				kind: 24133,
				pubkey,
				content,
				tags: [["p", pk]],
			},
			sk,
		);

		const relay = await Relay.connect(nostrConnectRelay);
		relay.publish(signedSignEvent);

		return new Promise((resolve) => {
			relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
				async onevent(event) {
					pk = event.pubkey;
					try {
						const response = JSON.parse(
							await nip04.decrypt(sk, pk, event.content),
						);

						if (response.id === id) resolve(JSON.parse(response.result));
					} catch (e) {
						console.log("failed to parse nostr connect event", e);
					}
				},
			});
		});
	},

	async nsec(event, { sk }) {
		return finalizeEvent(event, sk);
	},

	async extension(event) {
		return window.nostr.signEvent(event);
	},

	async signer(event, { pubkey, sig }) {
		event.pubkey = pubkey;
		const signedEvent = {
			...event,
			id: getEventHash(event),
			sig,
		};
		return signedEvent;
	},
};
