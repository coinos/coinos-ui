<script>
	import screenfull from 'screenfull';
	export let src;
	let qr;
</script>

<div class="w-80 mx-auto my-5 cursor-pointer" bind:this={qr} on:click={() => screenfull.toggle(qr)} on:keydown={() => screenfull.toggle(qr)}>
	<img {src} class="mx-auto" />
</div>
