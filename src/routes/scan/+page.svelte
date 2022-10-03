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

<div class="flex w-full mb-4 px-4">
  <div class="bg-black mx-auto rounded-3xl">
	<video bind:this={vid} class="border-4 rounded-3xl border-black md:max-w-[600px]" />
  </div>
</div>

<div class="flex w-full">
	<button class="mx-auto border rounded-full px-6 py-2 font-bold hover:opacity-80" on:click={back}>
		Cancel
	</button>
</div>

<style>
	video {
		transition: transform 0.3s ease-out;
		transform: scale(1);
	}
</style>
