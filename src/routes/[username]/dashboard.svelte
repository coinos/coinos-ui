<script>
	import { post, failure } from '$lib/utils';
	import { tick } from 'svelte';
	import { AppHeader, Icon } from '$comp';
	import { rate, user, preferredCurrency } from '$lib/store';

	let payreq = '',
		payreqField,
		withdrawing;

	let toggle = async () => {
		withdrawing = !withdrawing;
		await tick();
		if (withdrawing) payreqField.focus();
	};

	let withdraw = async () => {
		try {
			await post('/withdraw', { payreq });
			withdrawing = false;
		} catch (e) {
			failure(e.message);
		}
	};

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

	$: feepayreq = new Intl.NumberFormat('en-US', {
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
			<h1 class="text-3xl md:text-4xl font-semibold mb-8">
				{withdrawing ? 'Withdraw' : 'Dashboard'}
			</h1>
			{#if !withdrawing}
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

				<span class="text-secondary text-xl block">{accountBalanceSats} SATS</span>

				<button class="rounded-full border py-2 font-bold w-28 mt-4" on:click={toggle}
					>Withdraw</button
				>
				<p class="text-secondary my-2">You will be charged a 1% withdrawal fee on the amount.</p>
			{:else}
				<div class="space-y-3 w-[250px] md:w-[500px] md:pr-20">
					<button on:click={() => (withdrawing = false)}>
						<Icon icon="arrow-left" style="w-8" />
					</button>

					<div>
						<label for="invoice" class="font-bold mb-1 block">Invoice</label>
						<input
							bind:this={payreqField}
							type="text"
							name="payreq"
							required
							bind:value={payreq}
							class="block rounded-2xl p-3 w-full bg-primary"
						/>
					</div>

					<div>
						<label for="note" class="font-bold mb-1 block">Note (Optional)</label>
						<textarea name="note" rows={2} class="block rounded-2xl p-3 w-full bg-primary" />
					</div>

					<button
						disabled={!payreq}
						class="{!payreq
							? 'opacity-50'
							: 'opacity-100'} rounded-2xl border py-3 font-bold w-full mt-2 bg-black text-white"
						on:click={withdraw}>Send</button
					>
				</div>
			{/if}
		</div>
	</div>
{/if}
