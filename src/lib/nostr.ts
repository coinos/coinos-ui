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
import { bytesToHex } from "@noble/hashes/utils.js";
import type { EventTemplate } from "nostr-tools";
import { get } from "svelte/store";

let nostrToolsPromise:
	| Promise<typeof import("nostr-tools")>
	| undefined;
let nip44Promise: Promise<typeof import("nostr-tools/nip44")> | undefined;
let relayPromise: Promise<typeof import("nostr-tools/relay")> | undefined;
let nip49Promise: Promise<typeof import("nostr-tools/nip49")> | undefined;

const loadNostrTools = () =>
	(nostrToolsPromise ||= import("nostr-tools"));
const loadNip44 = () => (nip44Promise ||= import("nostr-tools/nip44"));
const loadRelay = () => (relayPromise ||= import("nostr-tools/relay"));
const loadNip49 = () => (nip49Promise ||= import("nostr-tools/nip49"));

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
	const { nip04 } = await loadNostrTools();
	return nip04.encrypt(sk, recipient, message);
};

export const decrypt = async ({ event, user }: { event: any; user: any }) => {
	const cache = get(decrypted);
	try {
		let { content, pubkey, id } = event;
		if (cache[id]) return cache[id];
		if (pubkey === user.pubkey) pubkey = event.tags[0][1];

		const { nip04 } = await loadNostrTools();
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
			const { nip19 } = await loadNostrTools();
			return nip19.decode(k).data as Uint8Array;
		}
	}

	const { nsec } = user;

	if (nsec) {
		const { decrypt: nip49decrypt } = await loadNip49();
		k = nip49decrypt(nsec, await getPassword());
	} else {
		throw new Error("nsec not available");
	}

	const { nip19 } = await loadNostrTools();
	localStorage.setItem("nsec", nip19.nsecEncode(k));
	return k;
};

const decodeNsec = async (nsec: string): Promise<Uint8Array> => {
	const { nip19 } = await loadNostrTools();
	const { type, data } = nip19.decode(nsec);
	if (type === "nsec" && data instanceof Uint8Array) return data;
	throw new Error("invalid nsec");
};

export const getNsec = async (user: User) => {
	const { nip19 } = await loadNostrTools();
	return nip19.nsecEncode(await getPrivateKey(user));
};

export const setNsec = async (user: User, nsec: string) => {
	const { getPublicKey } = await loadNostrTools();
	user.pubkey = getPublicKey(await decodeNsec(nsec));
	user.nsec = await encryptNsec(nsec);
};

export const encryptNsec = async (nsec: string) => {
	const { encrypt: nip49encrypt } = await loadNip49();
	const d = await decodeNsec(nsec);
	return nip49encrypt(d, await getPassword());
};

export const sign = async (event: any, user?: any) => {
	if (user?.nsec && !get($signer)?.ready) {
		const sk = await getPrivateKey(user);
		const { getPublicKey } = await loadNostrTools();

		$signer.set({
			method: "nsec",
			ready: true,
			params: { sk: bytesToHex(sk), pk: getPublicKey(sk) },
		});
	}

	eventToSign.set(event);
	let unsubscribe;
	const { method, params } = await new Promise((r, j) => {
		unsubscribe = $signer.subscribe((v) => {
			if (v === "cancel") {
				j("cancelled");
				$signer.set(undefined);
			}
			v?.ready && r(v);
		});
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

const signingMethods: Record<string, (event: any, params: any) => Promise<any>> = {
	async connect(event: any, { sk, pk, pubkey }: any) {
		const id = crypto.randomUUID();
		const signEvent = {
			id,
			method: "sign_event",
			params: [JSON.stringify(event)],
		};

		const { nip04, finalizeEvent } = await loadNostrTools();
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

		const { Relay } = await loadRelay();
		const relay = await Relay.connect(nostrConnectRelay);
		relay.publish(signedSignEvent);

		return new Promise((resolve) => {
			relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
				async onevent(event) {
					pk = event.pubkey;
					try {
						let response;
						try {
							const { nip04 } = await loadNostrTools();
							response = JSON.parse(await nip04.decrypt(sk, pk, event.content));
						} catch (e) {
							const { getConversationKey, decrypt: nip44decrypt } =
								await loadNip44();
							const ck = await getConversationKey(sk, pk);
							response = JSON.parse(await nip44decrypt(event.content, ck));
						}

						if (response.id === id) resolve(JSON.parse(response.result));
					} catch (e) {
						console.log("failed to parse nostr connect event", e);
					}
				},
			});
		});
	},

	async nsec(event: any, { sk }: any) {
		const { finalizeEvent } = await loadNostrTools();
		return finalizeEvent(event, sk);
	},

	async extension(event: any) {
		return window.nostr!.signEvent(event);
	},

	async signer(event: any, { pubkey, sig }: any) {
		event.pubkey = pubkey;
		const { getEventHash } = await loadNostrTools();
		const signedEvent = {
			...event,
			id: getEventHash(event),
			sig,
		};
		return signedEvent;
	},
};

// Returns all the keys mentioned in the provided event's 'p' tags.
export const pTagKeys = (event: any): string[] => {
	let keys: string[] = [];
	for (const tag of event.tags) {
		if (tag[0] === "p") {
			keys.push(tag[1]);
		}
	}
	return keys;
}
