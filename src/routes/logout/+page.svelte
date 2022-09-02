<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { user, token } from '$lib/store';

	onMount(() => {
		$user = null;
		$token = null;
	});
</script>
