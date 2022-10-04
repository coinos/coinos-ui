<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { close } from '$lib/socket';

	onMount(() => {
		close();
		goto('/');
	});
</script>
