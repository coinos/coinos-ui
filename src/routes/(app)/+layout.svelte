<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onDestroy, onMount } from 'svelte';
	import { close, connect, send } from '$lib/socket';
	import { last, invoice, request, ndef, passwordPrompt, pin } from '$lib/store';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LoadingSplash, Invoice, Password, Request } from '$comp';
	import { warning, protectedRoutes } from '$lib/utils';
	import { t, locale } from '$lib/translations';

	const localeLocalStorageKey = 'sveltekit-i18n-locale';

	export let data;

	let { rate, user, subject, token, rates } = data;

	$: update(data);
	let update = (data) => {
		({ rate, user, subject, token, rates } = data);
	};

	onMount(async () => {
		let localStorageLocale = localStorage.getItem(localeLocalStorageKey);
		if (localStorageLocale) locale.set(localStorageLocale);

		locale.subscribe((lng) => {
			if (lng) localStorage.setItem(localeLocalStorageKey, lng);
		});

		if (browser) {
			let log = console.log;
			checkSocket();
			expirePin();

			// if (window.NDEFReader) {
			// 	try {
			// 		$ndef = new NDEFReader();
			// 		await $ndef.scan();
			//
			// 		$ndef.addEventListener('readingerror', (e) => {
			// 			console.log('nfc error', e);
			// 		});
			//
			// 		$ndef.addEventListener('reading', ({ message, serialNumber }) => {
			// 			goto(`/${user.username}/card/${serialNumber.replace(/:/g, '-')}`);
			// 		});
			// 	} catch (error) {
			// 		log('Argh! ' + error);
			// 	}
			// }
		}
	});

	$: browser && connect(token);

	let lost,
		checkTimer,
		expireTimer,
		counter = 0;

	let checkSocket = () => {
		counter++;
		lost = Date.now() - $last > 30000;
		if (lost) connect(token);
		if (counter > 5) {
			send('heartbeat', token);
			counter = 0;
		}

		checkTimer = setTimeout(checkSocket, 1000);
	};

	let expirePin = () => {
		$pin = null;
		expireTimer = setTimeout(expirePin, 300000);
	};

	onDestroy(() => {
		if (browser) {
			clearTimeout(checkTimer);
			clearTimeout(expireTimer);
		}
	});
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

<main data-sveltekit-prefetch class="pb-20">
	<slot />
</main>

{#if $invoice}
	<Invoice {user} />
{/if}

{#if $request}
	<Request {user} />
{/if}
