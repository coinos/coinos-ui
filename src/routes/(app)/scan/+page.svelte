<script>
	import { Icon } from '$comp';
	// import QrScanner from 'qr-scanner';

	import { Html5QrcodeScanner } from 'html5-qrcode';
	import { onMount, onDestroy } from 'svelte';
	import { back } from '$lib/utils';
	import { goto } from '$app/navigation';

	let scanner, vid;
	onMount(() => {
		// scanner = new QrScanner(vid, ({ data }) => scanner.stop() || goto(`/send/${encodeURI(data)}`), {
		// 	highlightScanRegion: true,
		// 	highlightCodeOutline: true
		// });
		// scanner.start();

		let html5QrcodeScanner = new Html5QrcodeScanner(
			'reader',
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			/* verbose= */ false
		);
		html5QrcodeScanner.render(onScanSuccess, onScanFailure);
	});

let yeah;
	function onScanSuccess(decodedText, decodedResult) {
		// handle the scanned code as you like, for example:
		console.log(`Code matched = ${decodedText}`, decodedResult);
    yeah = true;
	}

	function onScanFailure(error) {
		// handle scan failure, usually better to ignore and keep scanning.
		// for example:
		//console.warn(`Code scan error = ${error}`);
	}

	onDestroy(() => scanner?.stop());
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

{#if yeah}TRUE{/if}
<div id="reader" width="600px"></div>

<div class="flex w-full mb-4">
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
