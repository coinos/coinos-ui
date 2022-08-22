<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
	import { user, token, rate, rates, selectedRate } from '$lib/store';
	import { page } from '$app/stores';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { LoadingSplash } from '$comp';
	import { warning, protectedRoutes } from '$lib/utils';
	import { t } from '$lib/translations';

	$: $token = data.token;

	export let data;

	$rates = data.rates;
	$: $selectedRate = data.user && $rate * (data.rates[data.user.currency] / data.rates.USD);

	let ready = false;

	onMount(() => {
		if (protectedRoutes.find((p) => $page.url.pathname.match(p))) {
			if (!$token) {
				goto('/login');
				warning($t('error.signIn'));
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
		--toastBackground: #292929;
	}
</style>
