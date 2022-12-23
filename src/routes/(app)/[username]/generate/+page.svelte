<script>
	import { failure } from '$lib/utils';
	import { Buffer } from 'buffer';
	import { onMount } from 'svelte';
	import { bech32m } from 'bech32';
	import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from 'bip39';
	import * as ecc from 'tiny-secp256k1';
	import { bip32, stretch, post } from '$lib/utils';
	import { goto, invalidate } from '$app/navigation';
	import { loginRedirect } from '$lib/store';
	import { Pin } from '$comp';
	import { pin } from '$lib/store';

	export let data;
	let { user } = data;

	const { encode, toWords } = bech32m;

	let loaded, mnemonic, key, password, seed, entropy, cipher, pubkey, salt, child;

	onMount(async () => {
		setTimeout(() => (loaded = true), 50);
		generate();
	});

	let generate = async () => {
		if (!$pin?.length === 6) return setTimeout(generate, 1000);
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
		user.pin = $pin;

		try {
			await post(`/${user.username}/generate`, user);
		} catch (e) {
			if (e.message?.startsWith('Pin')) {
				$pin = '';
				failure('Wrong pin, try again');
			}
		}

		invalidate('app:user');
		setTimeout(() => goto($loginRedirect || `/${user.username}/dashboard`), 10);
	};

	$: $pin?.length === 6 && generate();
</script>

{#if loaded && user.haspin && $pin?.length !== 6}
	<Pin />
{/if}
