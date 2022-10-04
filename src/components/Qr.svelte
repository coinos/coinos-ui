<script>
	import screenfull from 'screenfull';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { copy } from '$lib/utils';

	export let image, text, qr, disabled;

	let toggle = () => screenfull.toggle(qr.firstChild);

	$: update(text);
	let update = async (text, fullscreen) => {
		if (!(browser && text)) return;
		let { default: QRCodeStyling } = await import('qr-code-styling');

		const qrCode = new QRCodeStyling({
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
		});

		while (qr.firstChild) qr.removeChild(qr.lastChild);
		qrCode.append(qr);
	};
</script>

<div bind:this={qr} on:click={toggle} />

<style>
	div {
		@apply w-[300px]
      h-[300px]
      rounded-3xl
      block
      justify-center
      items-center
      cursor-pointer
      mx-auto;
	}
</style>
