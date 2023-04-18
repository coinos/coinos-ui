<script>
	import { goto } from '$app/navigation';
	import { Pin } from '$comp';
	import { pin } from '$lib/store';

	export let data;

	let { user } = data;
	let cancel = () => goto(`/${user.username}`);
</script>

{#if user.haspin && (!$pin || $pin?.length !== 6)}
	<Pin bind:value={$pin} {cancel} />
{/if}

<slot />
