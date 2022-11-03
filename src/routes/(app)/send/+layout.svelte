<script>
	import { Pin } from '$comp';
	import { pin } from '$lib/store';
	import { onMount } from 'svelte';

	export let data;

	let loaded;
	let { user } = data;

	onMount(() => setTimeout(() => (loaded = true), 50));
</script>

{#if loaded && user.haspin && $pin?.length !== 6}
	<Pin />
{/if}

<slot />
