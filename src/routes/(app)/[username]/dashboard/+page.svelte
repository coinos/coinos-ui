<script>
	import { f, s, post, failure, sat, sats } from '$lib/utils';
	import { tick } from 'svelte';
	import { Icon } from '$comp';
	import { rate, selectedRate } from '$lib/store';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let data;

	let ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
	let interval, rateInterval;

	let oldRate = $selectedRate;
	let animatedRate = oldRate;
	$: animateRate($selectedRate);
	let animateRate = (newRate) => {
		if (!accountBalanceFiat) return;
		let t = 0;
		let newBalance = (user.account.balance * newRate) / sats;
		let oldBalance = parseFloat(accountBalanceFiat);
		let diff = oldBalance - newBalance;
		let rateDiff = oldRate - newRate;

		clearInterval(rateInterval);
		rateInterval = setInterval(() => {
			let delta = rateDiff * ease(t / 100);
			animatedRate = (oldRate - delta).toFixed(2);
			if (t > 80) clearInterval(interval);
			t++;
		}, 10);

		oldRate = newRate;

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

<div class="container px-4 max-w-md mx-auto mt-20 space-y-12">
	<div>
		<div class="text-5xl font-bold mb-2">
			{$selectedRate ? f(accountBalanceFiat, user.currency) : $t('user.dashboard.fetchingRate')}
		</div>

		<div class="text-secondary text-2xl">
			⚡️{s(user.account.balance)}
		</div>
	</div>

	<div class="grid sm:grid-cols-2 gap-2">
		<a href="/send">
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full"
				>{$t('user.dashboard.withdraw')}</button
			>
		</a>
		<a href={`/${user.username}/receive`}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full"
				>{$t('user.dashboard.receive')}</button
			>
		</a>
		<a href={`/${user.username}/address`}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full"
				>Deposit</button
			>
		</a>
		<a href={`/${user.username}/settings`}>
			<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full"
				>Settings</button
			>
		</a>
	</div>

	<div class="grid grid-cols-2">
		<div class="text-secondary flex">
			<div class="flex mr-1">
				<div class="my-auto mr-1">1</div>
				<img src="/images/bitcoin.svg" class="w-5 my-auto" />
			</div>
			<div>= {f(animatedRate, user.currency)}</div>
		</div>
		<div class="text-secondary flex ml-auto">
			<div>{sat(sats)} =</div>
			<div class="flex ml-1">
				<div class="my-auto mr-1">1</div>
				<img src="/images/bitcoin.svg" class="w-5 my-auto" />
			</div>
		</div>
	</div>
</div>
