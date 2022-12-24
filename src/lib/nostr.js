import { entropyToMnemonic, mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { bech32m } from 'bech32';
import { bip32, post, stretch } from '$lib/utils';
import { calculateId, signId } from 'nostr';

const { decode, fromWords } = bech32m;

export let send = async (event, { cipher, username, salt }, password) => {
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

	await post(`/${username}`, { event });
};
