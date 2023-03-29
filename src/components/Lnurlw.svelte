<script>
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Numpad, Spinner } from '$comp';
	import { pin } from '$lib/store';

	export let data, form;

	let { currency, username } = data.user;
	let { defaultDescription, minWithdrawable, maxWithdrawable, k1, callback, rates } = data;
	$: rate = rates[currency];

	let amount = Math.round(maxWithdrawable / 1000),
		loading;

	let submit = () => (loading = true);
</script>

<div class="container px-4 mt-20 max-w-xl mx-auto">
	<div class="text-center mb-8">
		<div>
			<h1 class="text-3xl md:text-4xl font-semibold mb-2">{defaultDescription}</h1>
		</div>
	</div>

	{#if form?.error}
		<div class="text-red-600 text-center mb-5">
			{form.error}
		</div>
	{/if}

	<Numpad bind:amount {currency} bind:rate />

	<form action="?/withdraw" method="POST" use:enhance on:submit={submit}>
		<input name="amount" value={amount} type="hidden" />
		<input name="username" value={username} type="hidden" />
		<input name="currency" value={currency} type="hidden" />
		<input name="minWithdrawable" value={minWithdrawable} type="hidden" />
		<input name="maxWithdrawable" value={maxWithdrawable} type="hidden" />
		<input name="callback" value={callback} type="hidden" />
		<input name="k1" value={k1} type="hidden" />

		<div class="flex w-full">
			<button
				type="submit"
				class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
			>
				{#if loading}
					<Spinner />
				{:else}
					{$t('payments.redeem')}
				{/if}
			</button>
		</div>
	</form>
</div>
