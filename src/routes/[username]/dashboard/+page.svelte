<script>
	import { f, s, post, failure, sats } from '$lib/utils';
	import { tick } from 'svelte';
	import { AppHeader, Icon } from '$comp';
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
    let newBalance = (user.account.balance * newRate / sats);
    let oldBalance = parseFloat(accountBalanceFiat);
    let diff = oldBalance - newBalance;

		clearInterval(interval);
		interval = setInterval(() => {
			let delta = diff * ease(t / 100);
			accountBalanceFiat = (oldBalance - delta).toFixed(2)
			if (t > 80) clearInterval(interval);
			t++;
		}, 10);
	};

	$: user = data.user;
  $: accountBalanceFiat = accountBalanceFiat || user && $rate && (user.account.balance * $rate / sats).toFixed(2);

	let payreq = '',
		payreqField,
		withdrawing,
		loading;

	let toggle = async () => {
		payreq = '';
		withdrawing = !withdrawing;
		await tick();
		if (withdrawing) payreqField.focus();
	};

	let withdraw = async () => {
		loading = true;
		try {
			await post('/withdraw', { payreq });
			withdrawing = false;
			loading = false;
		} catch (e) {
			failure(e.message);
			loading = false;
		}
	};

	$: btcPrice = f($selectedRate, user.currency);

	$: accountBalanceBtc = user.account.balance / sats;

	$: accountBalanceSats = s(user.account.balance);
</script>

<AppHeader avatarPosition="left-[calc(50vw-64px)] lg:left-[calc(15vw-64px)]" />

<div class="text-center mx-auto lg:text-left lg:mx-0 lg:ml-[calc(15vw-64px)] mt-20 w-full md:w-72">
	<h2 class="text-3xl font-semibold">{user.username}</h2>

	{#if user.address}
		<span class="text-secondary">{user.address}</span>
	{/if}
</div>

<div class="px-3 md:px-0 flex justify-center items-center mt-10 lg:mt-0 mb-20">
	<div>
		<h1 class="text-3xl md:text-4xl font-semibold mb-8">
			{withdrawing ? 'Withdraw' : 'Dashboard'}
		</h1>
		{#if !withdrawing}
			<!-- <span class="text-secondary mx-auto text-lg font-bold" -->
			<!-- 	>{$t('user.dashboard.bitcoinPrice')} -->
			<!-- 	<span class="text-black" -->
			<!-- 		>{$selectedRate ? btcPrice : $t('user.dashboard.fetchingRate')}</span -->
			<!-- 	> -->
			<!-- </span> -->
			<!--  -->
			<h3 class="text-secondary font-bold border-b pb-1 mt-10 mb-6 w-full md:w-[500px]">
				{$t('user.dashboard.ACCOUNT_BALANCE')}
			</h3>

			<span class="text-3xl font-bold block mb-1">{accountBalanceSats} SAT</span>

			<span class="text-secondary text-xl block"
				>{$selectedRate ? f(accountBalanceFiat, user.currency) : $t('user.dashboard.fetchingRate')}</span
			>

			<div class="md:flex md:space-x-5">
				<button
					class="rounded-full border py-2 px-5 font-bold mt-4 block md:inline hover:opacity-80"
					on:click={() => goto(`/${user.username}/receive`)}>{$t('user.dashboard.receive')}</button
				>
				<button
					class="rounded-full border py-2 px-5 font-bold mt-5 md:mt-4 hover:opacity-80"
					on:click={toggle}>{$t('user.dashboard.withdraw')}</button
				>
			</div>
		{:else}
			<div class="space-y-3 w-[250px] md:w-[500px] md:pr-20">
				<button on:click={() => (withdrawing = false)}>
					<Icon icon="arrow-left" style="w-8 hover:opacity-80" />
				</button>

				<div>
					<!-- found missing translation -->
					<label for="invoice" class="font-bold mb-1 block">Lightning Invoice</label>
					<input
						bind:this={payreqField}
						type="text"
						name="payreq"
						required
						bind:value={payreq}
						class="block rounded-2xl p-3 w-full bg-primary"
					/>
				</div>

				<!-- TODO -->
				<!--
				<div>
					<label for="note" class="font-bold mb-1 block">{$t('user.dashboard.optionalNote')}</label>
					<textarea name="note" rows={2} class="block border rounded-2xl p-3 w-full bg-primary" />
				</div>
-->

				<button
					disabled={!payreq}
					class="{!payreq
						? 'opacity-50'
						: 'opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold w-full mt-2 bg-black text-white"
					on:click={withdraw}
				>
					{#if loading}
						<svg
							class="mx-auto h-6 w-6 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					{:else}
						{$t('user.dashboard.send')}
					{/if}
				</button>
			</div>
		{/if}
	</div>
</div>
