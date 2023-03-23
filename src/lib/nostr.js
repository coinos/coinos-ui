import { get } from 'svelte/store';
import { Buffer } from 'buffer';
import { fail, wait, post, stretch } from '$lib/utils';
import { decrypted, password as pw, passwordPrompt, pin, loginRedirect } from '$lib/store';
import { goto, invalidate } from '$app/navigation';
import { getPublicKey, signEvent, getEventHash, nip04, nip06 } from 'nostr-tools';
import { mnemonicToEntropy, entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { bech32m } from '@scure/base';

const { generateSeedWords, privateKeyFromSeedWords } = nip06;
const { encode, decode, toWords, fromWords } = bech32m;

export let generate = async (user) => {
	if (!get(pin)?.length === 6) return;
	let password = get(pw);

	let salt = crypto.getRandomValues(new Uint8Array(16));
	let mnemonic = generateSeedWords();
	let sk = privateKeyFromSeedWords(mnemonic);

	let bytes = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(password, salt),
			Uint8Array.from(Buffer.from(mnemonicToEntropy(mnemonic, wordlist), 'hex'))
		)
	);

	user.pubkey = getPublicKey(sk);
	user.cipher = encode('en', toWords(bytes), 180);
	user.salt = Buffer.from(salt).toString('hex');
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

		let message = await nip04.decrypt(await getPrivateKey(user), pubkey, content);

		cache[id] = Buffer.from(message).toString('utf8');
		decrypted.set(cache);

		return cache[id];
	} catch (e) {
		// console.log(e);
	}
};

function typedArrayToBuffer(array) {
	return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}

let getPrivateKey = async (user) => {
	let { cipher, username, salt } = user;
	let password = get(pw);

	if (!password) {
		passwordPrompt.set(true);
	}

	try {
		await post('/password', { password });
	} catch (e) {
		passwordPrompt.set(true);
	}

	await wait(() => !!get(pw));
	password = get(pw);

	let mnemonic, key, seed, entropy, child, privkey;

	entropy = new Uint8Array(
		await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(password, Buffer.from(salt, 'hex')),
			Uint8Array.from(fromWords(decode(cipher, 180).words))
		)
	);

	mnemonic = entropyToMnemonic(entropy, wordlist);
	return privateKeyFromSeedWords(mnemonic);
};

export let sign = async ({ event, user }) => {
	event.id = getEventHash(event);
	event.sig = signEvent(event, await getPrivateKey(user));
};

export let send = (event) => {
	return post('/events', { event });
};

export let reEncryptEntropy = async (user, newPassword) => {
	let { cipher, username, salt } = user;
	let password = get(pw);

	if (!password) {
		passwordPrompt.set(true);
	}

	try {
		await post('/password', { password });
	} catch (e) {
		passwordPrompt.set(true);
	}

	await wait(() => !!get(pw));
	password = get(pw);

	let mnemonic, key, seed, entropy, child, privkey;
	entropy = Buffer.from(
		await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(password, Buffer.from(salt, 'hex')),
			Uint8Array.from(fromWords(decode(cipher, 180).words))
		),
		'hex'
	).toString('hex');

	let bytes = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(newPassword, Buffer.from(salt, 'hex')),
			Uint8Array.from(Buffer.from(entropy, 'hex'))
		)
	);

	return encode('en', toWords(bytes), 180);
};
