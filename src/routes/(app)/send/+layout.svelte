<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { Pin } from '$comp';
	import { pin } from '$lib/store';
	import { onMount } from 'svelte';
	import { success, fail, post } from '$lib/utils';

	export let data;

	let { user } = data;
	let cancel = () => goto(`/${user.username}`);
</script>

{#if user.haspin && (!$pin || $pin?.length !== 6)}
	<Pin bind:value={$pin} {cancel} />
{/if}

<slot />
