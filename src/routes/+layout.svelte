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
	import { t, locale } from '$lib/translations';

	const localeLocalStorageKey = 'sveltekit-i18n-locale';

	export let data;

	$: $token = data.token;
	$: $user = data.user;

	$rates = data.rates;
	$: $selectedRate = $user && $rate * (data.rates[data.user.currency] / data.rates.USD);

	onMount(() => {
		let localStorageLocale = localStorage.getItem(localeLocalStorageKey);
		if (localStorageLocale) locale.set(localStorageLocale);

		locale.subscribe((lng) => {
			if (lng) localStorage.setItem(localeLocalStorageKey, lng);
		});

		if (protectedRoutes.find((p) => $page.url.pathname.match(p))) {
			if (!$token) {
				goto('/login');
				warning($t('error.signIn'));
			}
		}

		connect();
	});
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<slot />

<style global>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
		--toastBackground: #292929;
	}

	button.primary {
		@apply rounded-full border py-2 font-bold my-4 flex px-4 bg-white mx-auto hover:bg-primary;
	}

	input {
		@apply block border rounded-2xl px-5 py-4 w-full;
	}

	select {
		@apply border rounded-2xl py-4 px-5;
		-webkit-appearance: none;
		-moz-appearance: none;
		background: transparent;
		background-image: url('/icons/down.svg');
		background-repeat: no-repeat;
		background-position-x: 100%;
		background-position-y: 0.7em;
	}
</style>
