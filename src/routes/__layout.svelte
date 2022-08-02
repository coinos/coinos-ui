<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { toast } from '@zerodevx/svelte-toast';
	import '../app.css';
  import '$lib/i18n';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
	import { user, token } from '$lib/store';
	import { page, session } from '$app/stores';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { LoadingSplash } from '$comp';
	import { protectedRoutes } from '$lib/utils';

	browser && ($token ||= $session.token);
	let ready = false;

	onMount(() => {
		if (protectedRoutes.find((p) => $page.url.pathname.match(p))) {
			if (!$token) {
				goto('/login');
				toast.push('Please sign in to continue.');
			}
			user.subscribe((u) => u?.username && (ready = true));
		} else {
			ready = true;
		}

		connect();
	});
</script>

{#if ready}
	<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
	<slot />
{:else}
	<LoadingSplash />
{/if}

<style>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
	}
</style>
