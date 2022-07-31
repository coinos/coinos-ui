<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { toast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
	import { user, token } from '$lib/store';
	import { page, session } from '$app/stores';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { LoadingSplash } from '$comp';

	browser && ($token ||= $session.token);
	let protectedRoutes = [/receive/];
	let ready = false;

	onMount(() => {
		if (protectedRoutes.find((p) => $page.url.pathname.match(p))) {
			if (!$token) {
				goto('/login');
				toast.push('Please sign in to continue.');
			}
			user.subscribe((u) => (ready = true));
		} else {
			ready = true;
		}

		connect();
	});
</script>

{#if ready}
	<SvelteToast />
	<slot />
{:else}
	<LoadingSplash />
{/if}
