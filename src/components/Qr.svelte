<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { copy } from '$lib/utils';

	export let image, text, qr;

	$: update(text);
	let update = async (text) => {
		if (!(browser && text)) return;
		let { default: QRCodeStyling } = await import('qr-code-styling');

		const qrCode = new QRCodeStyling({
			width: window.screen.width < 640 ? 250 : 300,
			type: 'canvas',
			data: text,
			backgroundOptions: {
				color: 'rgba(0, 0, 0, 0)'
			},
			dotsOptions: {
				type: 'rounded'
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

<div bind:this={qr} on:click={() => copy(text)} />

<style>
	div {
		@apply px-5 
      md:px-0 
      w-[292px] 
      h-[302px]
      md:w-[300px]
      md:h-[300px]
      rounded-3xl
      block
      md:flex
      justify-center
      items-center
      cursor-pointer
      mx-auto;
	}
</style>
