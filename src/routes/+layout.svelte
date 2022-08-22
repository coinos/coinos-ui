<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '$lib/i18n';
	import { isLoading, locale } from 'svelte-i18n';
	import '../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
	import { user, token, rate, rates, selectedRate, conversion } from '$lib/store';
	import { page } from '$app/stores';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { LoadingSplash } from '$comp';
	import { warning, protectedRoutes } from '$lib/utils';
	import { _ } from 'svelte-i18n';

	$: $token = data.token;

	export let data;

	$rates = data.rates;
	$: $conversion = data.rates[data.user.currency] / $rate;
	$: $selectedRate = $rate * $conversion;

	let ready = false;

	onMount(() => {
		let localStorageLocale = localStorage.getItem('svelte-i18n-locale');
		if (localStorageLocale) locale.set(localStorageLocale);

		locale.subscribe((lng) => {
			if (lng) localStorage.setItem('svelte-i18n-locale', lng);
		});

		if (protectedRoutes.find((p) => $page.url.pathname.match(p))) {
			console.log('TOKEN', $token);
			if (!$token) {
				goto('/login');
				warning($_('error.signIn'));
			}
			user.subscribe((u) => u?.username && (ready = true));
		} else {
			ready = true;
		}

		connect();
	});
</script>

{#if ready && !$isLoading}
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
