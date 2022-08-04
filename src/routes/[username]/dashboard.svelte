<script>
	import { AppHeader } from '$comp';
	import { rate, user, preferredCurrency } from '$lib/store';

	$: btcPrice = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format($rate);

	$: accountBalanceFiat = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format($user.account.balance * ($rate / 100000000));

	$: accountBalanceBtc = $user.account.balance / 100000000;

	$: accountBalanceSats = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		$user.account.balance
	);

	$: feeAmount = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(($user.account.balance * ($rate / 100000000)) / 100);
</script>

{#if $user}
	<AppHeader avatarPosition="left-[calc(50vw-48px)] lg:left-[calc(15vw-48px)]" />

	<div
		class="text-center mx-auto lg:text-left lg:mx-0 lg:ml-[calc(15vw-48px)] mt-12 w-full md:w-72"
	>
		<h2 class="text-2xl font-semibold">{$user.username}</h2>
		<span class="text-secondary">Address goes here</span>
	</div>

	<div class="px-3 md:px-0 flex justify-center items-center mt-10 lg:mt-0 mb-20">
		<div>
			<h1 class="text-3xl md:text-4xl font-semibold mb-8">Dashboard</h1>

			<span class="text-secondary mx-auto text-lg font-bold"
				>Bitcoin Price: <span class="text-black">{$rate ? btcPrice : 'fetching rate...'}</span>
				{$preferredCurrency}
			</span>

			<span class="text-secondary block mt-1"
				>Data from <span class="text-black">Binance</span>.
			</span>

			<h3 class="text-secondary font-bold border-b pb-1 mt-10 mb-6 w-full md:w-[500px]">
				ACCOUNT BALANCE
			</h3>

			<span class="text-3xl font-bold block mb-1"
				>{$rate ? accountBalanceFiat : 'fetching rate...'}</span
			>

			<span class="text-secondary text-xl block"
				>{accountBalanceSats} SATS
			</span>

			<button class="rounded-full border py-2 font-bold w-28 mt-4">Withdraw</button>
			<p class="text-secondary mt-2">
				You will be charged a 1% withdrawal fee on the amount.
			</p>
		</div>
	</div>
{/if}
