<script>
	import { selectedRate } from '$lib/store';
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back, f, s, sats } from '$lib/utils';
	export let data;
	export let form;

	let { recipient, user } = data;
	let { currency } = user;

	let amount = form?.amount || data.amount;
	let a,
		af,
		amountFiat,
		fiat = true;

	let setAmount = () => {
		console.log('setting', a, af);
		amount = a;
		amountFiat = af;
	};

	let handleBack = () => {
		if (amount) amount = undefined;
		else back();
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={handleBack}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 mt-20 max-w-xl mx-auto">
	{#if amount}
		<div class="text-center mb-8">
			<h1 class="text-xl md:text-2xl text-secondary mb-2">Sending</h1>
			<p class="text-6xl break-words mb-4">{fiat ? f(amountFiat, currency) : `${s(a)} sats`}</p>

			<h1 class="text-xl md:text-2xl text-secondary mb-2">To</h1>
			<p class="text-6xl break-words">{recipient.username}</p>
		</div>
	{:else}
		<Numpad bind:amount={a} bind:amountFiat={af} {currency} bind:fiat />
	{/if}

	<form method="POST" use:enhance>
		<input name="amount" value={amount} type="hidden" />
		<input name="confirmed" value={form?.confirm} type="hidden" />

		<div class="flex w-full">
			{#if amount}
				<button
					type="submit"
					class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
				>
					Send
				</button>
			{:else}
				<button
					type="button"
					class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
					on:click={setAmount}
				>
					Next
				</button>
			{/if}
		</div>
	</form>
</div>
