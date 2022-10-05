<script>
	import { f, s, post, failure, sats } from '$lib/utils';
	import { tick } from 'svelte';
	import { Icon } from '$comp';
	import { rate, selectedRate } from '$lib/store';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let data;

	let ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
	let interval;

	$: animateRate($rate);
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
		accountBalanceFiat || (user && $rate && ((user.account.balance * $rate) / sats).toFixed(2));

	let payreq = '',
		payreqField,
		loading;

	$: btcPrice = f($selectedRate, user.currency);

	$: accountBalanceBtc = user.account.balance / sats;

	$: accountBalanceSats = s(user.account.balance);
</script>

<div class="text-center mx-auto lg:text-left lg:mx-0 lg:ml-[calc(15vw-64px)] mt-20 w-full md:w-72">
	<h2 class="text-3xl font-semibold">{user.username}</h2>

	{#if user.address}
		<span class="text-secondary">{user.address}</span>
	{/if}
</div>

<div class="px-3 md:px-0 flex justify-center items-center mt-10 lg:mt-0 mb-20">
	<div>
		<span class="text-3xl font-bold block mb-1"
			>{$selectedRate
				? f(accountBalanceFiat, user.currency)
				: $t('user.dashboard.fetchingRate')}</span
		>

		<span class="text-secondary text-xl block">
			{accountBalanceSats} SAT
		</span>

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
</div>
