<script>
	import { rate } from '$lib/store';
	import { onMount } from 'svelte';

  export let text;
</script>

QR code

{text}

{$rate}
