import { get } from 'svelte/store';
import * as ecc from 'tiny-secp256k1';
import { generateMnemonic, entropyToMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { bech32m } from 'bech32';
import { bip32, failure, wait, post, stretch } from '$lib/utils';
import { calculateId, signId } from 'nostr';
import { password as pw, passwordPrompt, pin, loginRedirect } from '$lib/store';
import { goto, invalidate } from '$app/navigation';

const { encode, decode, fromWords, toWords } = bech32m;

export let generate = async (user) => {
	let mnemonic, key, seed, entropy, cipher, salt, child;

	if (!get(pin)?.length === 6) return;

	let password = get(pw);

	if (!password) {
		passwordPrompt.set(true);
	}

	try {
		await post('/password', { password });
	} catch (e) {
		console.log(e);
		passwordPrompt.set(true);
	}

	await wait(() => !!get(pw));
	password = get(pw);

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
	user.pin = get(pin);

	try {
		await post(`/${user.username}/generate`, user);
	} catch (e) {
		if (e.message?.startsWith('Pin')) {
			pin.set('');
			failure('Wrong pin, try again');
		}
	}

	invalidate('app:user');
	setTimeout(() => goto(get(loginRedirect) || `/${user.username}/dashboard`), 10);
};

export let sign = async ({ event, user }) => {
	let { cipher, username, salt } = user;

	let password = get(pw);

	if (!password) {
		passwordPrompt.set(true);
	}

	try {
		await post('/password', { password });
	} catch (e) {
		console.log(e);
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
	privkey = child.privateKey;

	event.id = await calculateId(event);
	event.sig = await signId(privkey, event.id);
};

export let send = (event) => {
	return post('/events', { event });
};
