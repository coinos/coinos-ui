<script>
	import { onMount } from 'svelte';
	import { user, token } from '$lib/store';
	import { goto } from '$app/navigation';
	import { close } from '$lib/socket';

	onMount(() => {
		$token = null;
		$user = null;
		close();
	});
	goto('/');
</script>
