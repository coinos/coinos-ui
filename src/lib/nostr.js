import { get } from 'svelte/store';
import * as ecc from 'tiny-secp256k1';
import { generateMnemonic, entropyToMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { bech32m } from 'bech32';
import { bip32, fail, wait, post, stretch } from '$lib/utils';
import { calculateId, signId } from 'nostr';
import { password as pw, passwordPrompt, pin, loginRedirect } from '$lib/store';
import { goto, invalidate } from '$app/navigation';

const { encode, decode, fromWords, toWords } = bech32m;

export let generate = async (user) => {
	let password = get(pw);
	let mnemonic, key, seed, entropy, cipher, salt, child;

	if (!get(pin)?.length === 6) return;

	mnemonic = generateMnemonic();
	seed = mnemonicToSeedSync(mnemonic);
	entropy = mnemonicToEntropy(mnemonic);
	key = bip32.fromSeed(seed);
	child = key.derivePath("m/44'/1237'/0'/0/0");
	salt = crypto.getRandomValues(new Uint8Array(16));

	let bytes = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(password, salt),
			Uint8Array.from(Buffer.from(entropy, 'hex'))
		)
	);

	user.pubkey = Buffer.from(ecc.xOnlyPointFromPoint(child.publicKey)).toString('hex');
	user.cipher = encode('en', toWords(bytes), 180);
	user.salt = Buffer.from(salt).toString('hex');
};

export let encrypt = async ({ message, recipient, user }) => {
	let sharedPoint = Buffer.from(
		ecc.pointMultiply(
			Uint8Array.from(Buffer.from('02' + recipient, 'hex')),
			Buffer.from(await getPrivateKey(user), 'hex')
		)
	);

	let iv = crypto.getRandomValues(new Uint8Array(16));
	let cipher = await crypto.subtle.encrypt(
		{ name: 'AES-CBC', iv },
		await crypto.subtle.importKey('raw', sharedPoint.slice(1), 'AES-CBC', true, [
			'encrypt',
			'decrypt'
		]),
		new TextEncoder().encode(message)
	);

	return Buffer.from(cipher).toString('base64') + '?iv=' + Buffer.from(iv).toString('base64');
};

export let decrypt = async ({ event, user }) => {
	try {
		let { content, pubkey } = event;
		if (pubkey === user.pubkey) pubkey = event.tags[0][1];
		pubkey = Uint8Array.from(Buffer.from('02' + pubkey, 'hex'));

		let sharedPoint = Buffer.from(
			ecc.pointMultiply(pubkey, Buffer.from(await getPrivateKey(user), 'hex'))
		);

		let [cipher, iv] = content.split('?iv=');
		cipher = Uint8Array.from(Buffer.from(cipher, 'base64'));
		iv = Uint8Array.from(Buffer.from(iv, 'base64'));

		let key = await crypto.subtle.importKey('raw', sharedPoint.slice(1), 'AES-CBC', true, [
			'encrypt',
			'decrypt'
		]);

		let message = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, cipher);

		return Buffer.from(message).toString('utf8');
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
	entropy = Buffer.from(
		await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: new Uint8Array(16) },
			await stretch(password, Buffer.from(salt, 'hex')),
			Uint8Array.from(fromWords(decode(cipher, 180).words))
		),
		'hex'
	).toString('hex');

	mnemonic = entropyToMnemonic(entropy);
	seed = mnemonicToSeedSync(mnemonic);
	key = bip32.fromSeed(seed);
	child = key.derivePath("m/44'/1237'/0'/0/0");

	return child.privateKey;
};

export let sign = async ({ event, user }) => {
	let privkey = await getPrivateKey(user);
	event.id = await calculateId(event);
	event.sig = await signId(privkey, event.id);
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
