<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { onDestroy, onMount } from 'svelte';
	import { close, connect, send } from '$lib/socket';
	import { last, selectedRate, rate, user } from '$lib/store';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LoadingSplash } from '$comp';
	import { warning, protectedRoutes } from '$lib/utils';
	import { t, locale } from '$lib/translations';

	const localeLocalStorageKey = 'sveltekit-i18n-locale';

	export let data;

	let { subject } = $page.data;
	let r, u, token, rates;

	$: update(data);
	let update = () => {
		({ user: u, rate: r, token, rates } = data);
		$rate = r;
		$user = u;
	};

	$: $page.url.searchParams.get('logout') && close();

	$: $selectedRate = u && r * (rates[u.currency] / rates.USD);

	onMount(() => {
		let localStorageLocale = localStorage.getItem(localeLocalStorageKey);
		if (localStorageLocale) locale.set(localStorageLocale);

		locale.subscribe((lng) => {
			if (lng) localStorage.setItem(localeLocalStorageKey, lng);
		});

		browser && count();
	});

	$: browser && connect(token);

	let lost, timer;
	let count = () => {
		lost = Date.now() - $last > 10000;
		if (lost) connect(token);
		send('heartbeat');
		timer = setTimeout(count, 500);
	};

	onDestroy(() => browser && clearTimeout(timer));
</script>

<svelte:head>
	{#if subject}
		<title>coinos - {subject.username}</title>
		<meta name="lightning" content={`lnurlp:${subject.username}@coinos.io`} />
	{:else}
		<title>coinos</title>
	{/if}

	{#if subject?.profile}
		<meta name="og:image" content={`/api/public/${subject.username}-profile.webp`} />
	{:else}
		<meta property="og:image" content="/icons/logo.svg" />
	{/if}
</svelte:head>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />

{#if lost}
	<div class="fixed bottom-12 right-12 text-red-600 bg-white z-50 px-4 py-2 rounded-full border">
		Lost connection to server, try refreshing
	</div>
{/if}

<main data-sveltekit-prefetch>
	<slot />
</main>

<style global>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
		--toastBackground: #292929;
	}
</style>
