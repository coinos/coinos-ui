<script>
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
		height: 300,
		width: 300,
		type: 'canvas',
		data: text,
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

	$: update(text);
	let update = async (text, fullscreen) => {
		if (!(browser && text)) return;
		let { default: QRCodeStyling } = await import('qr-code-styling');

		const qrCode = new QRCodeStyling(opts);

		opts.height = Math.min(window.innerWidth, window.innerHeight);
		opts.width = opts.height;
		const fullQrCode = new QRCodeStyling(opts);

		while (qr.firstChild) qr.removeChild(qr.lastChild);
		qrCode.append(qr);

		while (fullQr.firstChild) fullQr.removeChild(fullQr.lastChild);
		fullQrCode.append(fullQr);
	};
</script>

<div bind:this={qr} on:click={toggle} class:hidden={full} />
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
