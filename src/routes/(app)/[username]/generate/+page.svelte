<script>
	import { Buffer } from 'buffer';
	import { onMount } from 'svelte';
	import { BIP32Factory } from 'bip32';
	import { bech32m } from 'bech32';
	import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from 'bip39';
	import * as ecc from 'tiny-secp256k1';
	import { post } from '$lib/utils';
	import { goto } from '$app/navigation';

	export let data;
	let { user } = data;

	const { encode, decode, fromWords, toWords } = bech32m;

	const stretch = async (password, salt) =>
		crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256'
			},
			await crypto.subtle.importKey(
				'raw',
				new TextEncoder().encode(password),
				{ name: 'PBKDF2' },
				false,
				['deriveBits', 'deriveKey']
			),
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);

	let mnemonic, key, password, seed, entropy, cipher, pubkey, salt, child;

	onMount(async () => {
		let bip32 = await BIP32Factory(ecc);
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

		await post(`/${user.username}/generate`, user);
		goto(`/${user.username}/dashboard`);
	});
</script>
