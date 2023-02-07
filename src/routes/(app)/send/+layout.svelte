<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { Pin } from '$comp';
	import { pin } from '$lib/store';
	import { onMount } from 'svelte';
	import { success, fail, post } from '$lib/utils';

	export let data;

	let loaded;
	let { user } = data;

	onMount(() => setTimeout(() => (loaded = true), 500));
	let cancel = () => goto(`/${user.username}`);

	$: browser && loaded && checkPin($pin);
	let checkPin = async (p) => {
		if (p?.length !== 6 || p === JSON.parse(sessionStorage.getItem('pin'))) return;
		let result;
		try {
			result = await post('/pin', { pin: p });
		} catch (e) {}

		if (result) {
			success('Pin confirmed');
		} else {
			fail('Invalid pin');
			$pin = '';
		}
	};
</script>

{#if loaded && user.haspin && $pin?.length !== 6}
	<Pin bind:value={$pin} {cancel} />
{/if}

<slot />
