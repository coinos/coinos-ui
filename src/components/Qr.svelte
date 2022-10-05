<script>
	import { fly, fade } from 'svelte/transition';
	import screenfull from 'screenfull';
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import { copy } from '$lib/utils';

	export let image, text, qr, fullQr, full;

	let toggle = async () => {
		full = !full;
		await tick();
		screenfull.toggle(fullQr.firstChild);
	};

	let opts = {
		type: 'canvas',
		backgroundOptions: {
			color: 'rgba(0, 0, 0, 0)'
		},
		cornersSquareOptions: {
			type: 'extra-rounded'
		},
		dotsOptions: {
			type: 'extra-rounded'
		},

		image,
		imageOptions: {
			hideBackgroundDots: false
		}
	};

	let mask = false;
	$: update(text);
	let update = async (text, fullscreen) => {
		mask = true;
		if (!(browser && text)) return;
		let { default: QRCodeStyling } = await import('qr-code-styling');

		opts.data = text;
		opts.height = opts.width = 300;
		const qrCode = new QRCodeStyling(opts);

		opts.height = opts.width = Math.min(window.innerWidth, window.innerHeight);
		const fullQrCode = new QRCodeStyling(opts);

		while (qr && qr.firstChild) qr.removeChild(qr.lastChild);
		qrCode.append(qr);

		while (fullQr && fullQr.firstChild) fullQr.removeChild(fullQr.lastChild);
		fullQrCode.append(fullQr);
		mask = false;
	};
</script>

{#if mask}
	<div class="absolute bg-white w-[300px] h-[300px] t-0 l-0 z-10" out:fade />
{/if}
<div bind:this={qr} on:click={toggle} class:hidden={full} class="relative overflow-visible" />
<div bind:this={fullQr} on:click={toggle} class:hidden={!full} />

<style>
	div {
		@apply w-[300px]
      h-[300px]
      rounded-3xl
      justify-center
      items-center
      cursor-pointer
      mx-auto;
	}
</style>
