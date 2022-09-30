<script>
	import { Icon } from '$comp';
	import QrScanner from 'qr-scanner';
	import { onMount } from 'svelte';
	import { back } from '$lib/utils';
	import { goto } from '$app/navigation';

	let scanner, vid;
	onMount(() => {
		scanner = new QrScanner(vid, (text) => goto(`/send/${text}`));
		scanner.start();
	});
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="flex w-full">
	<video bind:this={vid} class="w-full max-w-[600px] mx-auto" />
</div>
