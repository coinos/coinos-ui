<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onDestroy, onMount } from 'svelte';
	import { close, connect, send } from '$lib/socket';
	import { last, selectedRate, invoice, rate, user, request, passwordPrompt } from '$lib/store';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LoadingSplash, Invoice, Password, Request } from '$comp';
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

	$: $selectedRate = r * (rates[u?.currency || 'USD'] / rates.USD);

	onMount(() => {
		let localStorageLocale = localStorage.getItem(localeLocalStorageKey);
		if (localStorageLocale) locale.set(localStorageLocale);

		locale.subscribe((lng) => {
			if (lng) localStorage.setItem(localeLocalStorageKey, lng);
		});

		browser && checkSocket();
	});

	$: browser && connect(token);

	let lost,
		timer,
		counter = 0;

	let checkSocket = () => {
		counter++;
		lost = Date.now() - $last > 15000;
		if (lost) connect(token);
		if (counter > 5) {
			send('heartbeat');
			counter = 0;
		}
		timer = setTimeout(checkSocket, 1000);
	};

	onDestroy(() => browser && clearTimeout(timer));
</script>

{#if browser && $passwordPrompt}
	<Password {user} />
{/if}

<svelte:head>
	{#if subject}
		<title>coinos - {subject.username}</title>
		<meta name="lightning" content={`lnurlp:${subject.username}@coinos.io`} />
	{:else}
		<title>coinos</title>
	{/if}

	{#if subject?.profile}
		<meta name="og:image" content={`/api/public/${subject.uuid}-profile.webp`} />
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

<main data-sveltekit-prefetch class="pb-20">
	<slot />
</main>

{#if $invoice}
	<Invoice user={u} />
{/if}

{#if $request}
	<Request user={u} />
{/if}
