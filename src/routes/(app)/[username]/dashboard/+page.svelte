<script>
	import { f, s, post, failure, sat, sats } from '$lib/utils';
	import { tick } from 'svelte';
	import { Icon } from '$comp';
	import { rate, selectedRate } from '$lib/store';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let data;

	let ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
	let interval;

	$: animateRate($selectedRate);
	let animateRate = (newRate) => {
		if (!accountBalanceFiat) return;
		let t = 0;
		let newBalance = (user.account.balance * newRate) / sats;
		let oldBalance = parseFloat(accountBalanceFiat);
		let diff = oldBalance - newBalance;

		clearInterval(interval);
		interval = setInterval(() => {
			let delta = diff * ease(t / 100);
			accountBalanceFiat = (oldBalance - delta).toFixed(2);
			if (t > 80) clearInterval(interval);
			t++;
		}, 10);
	};

	$: user = data.user;
	$: accountBalanceFiat =
		accountBalanceFiat ||
		(user && $selectedRate && ((user.account.balance * $selectedRate) / sats).toFixed(2));

	let payreq = '',
		payreqField,
		loading;

	$: btcPrice = f($selectedRate, user.currency);

	$: accountBalanceBtc = user.account.balance / sats;
</script>

<div class="container px-4 max-w-md mx-auto mt-20">
	<div class="text-5xl font-bold mb-2">
		{$selectedRate ? f(accountBalanceFiat, user.currency) : $t('user.dashboard.fetchingRate')}
	</div>

	<div class="text-secondary text-2xl">
    {sat(user.account.balance)}
	</div>

	<div class="grid sm:grid-cols-2 gap-2 mt-8">
		<a href={`/${user.username}/receive`}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
				>{$t('user.dashboard.receive')}</button
			>
		</a>
		{#if user.account.balance > 0}
			<a href="/send">
				<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
					>{$t('user.dashboard.withdraw')}</button
				>
			</a>
		{:else}
			<a href={`/${user.username}/settings`}>
				<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
					>Setup Account</button
				>
			</a>
		{/if}
	</div>
</div>
