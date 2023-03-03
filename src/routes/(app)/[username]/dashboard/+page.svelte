<script>
	import { enhance } from '$app/forms';
	import { f, s, post, fail, sat, sats } from '$lib/utils';
	import { tick } from 'svelte';
	import { Avatar, Icon } from '$comp';
	import { rate, password, selectedRate } from '$lib/store';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';
	import { events } from '$lib/store';

	export let data;
	$: ({ invoices, requests } = data);

	let ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
	let interval, rateInterval;

	let oldRate = $selectedRate;
	let animatedRate = oldRate;
	$: animateRate($selectedRate);
	let animateRate = (newRate) => {
		if (!accountBalanceFiat) return;
		let t = 0;
		let newBalance = (user.balance * newRate) / sats;
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
		(user && $selectedRate && ((user.balance * $selectedRate) / sats).toFixed(2));

	let payreq = '',
		payreqField,
		loading;

	$: btcPrice = f($selectedRate, user.currency);

	$: accountBalanceBtc = user.balance / sats;
</script>

<div class="container px-4 max-w-md mx-auto mt-20 space-y-12 mb-8">
	<div class="mt-24 space-y-2">
		<div class="text-5xl font-bold">
			{$selectedRate ? f(accountBalanceFiat, user.currency) : $t('user.dashboard.fetchingRate')}
		</div>

		<div class="text-secondary text-2xl">
			⚡️{s(user.balance)}
		</div>
	</div>

	<div class="grid sm:grid-cols-2 gap-2 text-lg">
		<a href="/send">
			<button class="rounded-full border py-4 px-5 font-bold hover:opacity-80 w-full"
				>{$t('user.dashboard.send')}</button
			>
		</a>
		<a href={`/${user.username}/receive`}>
			<button class="rounded-full border py-4 px-5 font-bold hover:opacity-80 w-full"
				>{$t('user.dashboard.receive')}</button
			>
		</a>
	</div>

	<!-- <div> -->
	<!-- 	{#each invoices as { request_id, amount, currency, rate, user: recipient, requester, id }} -->
	<!-- 		{@const requested = user.username === requester?.username} -->
	<!-- 		<a href={`/invoice/${id}` + (requested ? '/tip' : '')}> -->
	<!-- 			<div class="border-b p-2 last:border-b-0 hover:bg-gray-100"> -->
	<!-- 				<div class="flex gap-2"> -->
	<!-- 					<div> -->
	<!-- 						{#if requested} -->
	<!-- 							<div class="flex"> -->
	<!-- 								<Avatar user={recipient} size={20} /> -->
	<!-- 								<div class="my-auto text-left"> -->
	<!-- 									<p class="text-secondary">{$t('payments.invoiceFrom')}</p> -->
	<!-- 									<p class="ml-1 text-lg break-words">{recipient.username}</p> -->
	<!-- 								</div> -->
	<!-- 							</div> -->
	<!-- 						{:else} -->
	<!-- 							<div class="flex"> -->
	<!-- 								<Avatar user={requester} size={20} /> -->
	<!-- 								<div class="my-auto text-left"> -->
	<!-- 									<p class="text-secondary">{$t('payments.awaiting')}</p> -->
	<!-- 									<p class="ml-1 text-lg break-words">{requester.username}</p> -->
	<!-- 								</div> -->
	<!-- 							</div> -->
	<!-- 						{/if} -->
	<!-- 					</div> -->
	<!-- 					<div class="whitespace-nowrap my-auto ml-auto flex gap-2"> -->
	<!-- 						<div class="font-bold"> -->
	<!-- 							{f(amount * (rate / sats), currency)} -->
	<!-- 						</div> -->
	<!--  -->
	<!-- 						<div class="text-secondary">{sat(amount)}</div> -->
	<!-- 					</div> -->
	<!-- 				</div> -->
	<!-- 			</div> -->
	<!-- 		</a> -->
	<!-- 	{/each} -->
	<!-- </div> -->

	<!-- <div> -->
	<!-- 	{#each requests as { id, invoice, memo, requester: r }} -->
	<!-- 		<a href={`/${user.username}/receive/${id}`}> -->
	<!-- 			<div class="border-b p-2 last:border-b-0 hover:bg-gray-100"> -->
	<!-- 				<div class="flex"> -->
	<!-- 					<div> -->
	<!-- 						<div class="flex"> -->
	<!-- 							<Avatar user={r} size={20} /> -->
	<!-- 							<div class="my-auto text-left"> -->
	<!-- 								<p class="ml-1 text-lg break-words">{r.username}</p> -->
	<!-- 								<p class="ml-1 text-secondary">{memo}</p> -->
	<!-- 							</div> -->
	<!-- 						</div> -->
	<!-- 					</div> -->
	<!-- 					<div class="whitespace-nowrap my-auto ml-auto flex gap-2"> -->
	<!-- 						<button class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full" -->
	<!-- 							>Invoice</button -->
	<!-- 						> -->
	<!-- 					</div> -->
	<!-- 				</div> -->
	<!-- 			</div> -->
	<!-- 		</a> -->
	<!-- 	{/each} -->
	<!-- </div> -->
</div>

<div class="flex fixed w-full px-4 bg-white py-2 bottom-0 bg-opacity-90">
	<div class="text-secondary flex mr-auto">
		<div class="flex mr-1">
			<div class="my-auto mr-1">1</div>
			<img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
		</div>
		<div>= {f(animatedRate, user.currency)}</div>
	</div>
	<div class="text-secondary flex ml-auto">
		<div class="flex">
			<div class="mr-1">⚡️{s((1 * sats) / animatedRate)} =</div>
			<div>{f(1, user.currency)}</div>
		</div>
	</div>
</div>
