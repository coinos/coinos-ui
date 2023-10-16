<script>
	import { Qr } from '$comp';
	export let data;
	let { src, text } = data;
</script>

<Qr {src} />

<div class="text-center w-full font-bold">
	{text}
</div>
