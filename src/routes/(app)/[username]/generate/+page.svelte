<script>
	import { failure } from '$lib/utils';
	import { Buffer } from 'buffer';
	import { onMount } from 'svelte';
	import { bech32m } from 'bech32';
	import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from 'bip39';
	import { goto, invalidate } from '$app/navigation';
	import { loginRedirect, password } from '$lib/store';
	import { Pin } from '$comp';
	import { pin } from '$lib/store';
	import { generate } from '$lib/nostr';

	export let data;
	let { user } = data;

	let loaded;

	onMount(async () => {
		setTimeout(() => (loaded = true), 50);
		generate(user);
	});

	$: $pin?.length === 6 && generate(user);
</script>

{#if loaded && user?.haspin && $pin?.length !== 6}
	<Pin />
{/if}
