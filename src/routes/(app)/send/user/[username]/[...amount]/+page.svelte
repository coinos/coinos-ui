<script>
	import { t } from '$lib/translations';
	import { goto } from '$app/navigation';
	import { pin, selectedRate } from '$lib/store';
	import { enhance } from '$app/forms';
	import { AppHeader, Avatar, Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { f, post, s, sat, sats } from '$lib/utils';

	export let data;
	export let form;

	let { subject, rates, user } = data;
	let currency = user?.currency || 'USD';

	let amount = form?.amount || data.amount;
	let a,
		af,
		amountFiat = amount * ($selectedRate / sats),
		fiat = !amount,
		hash;

	let setAmount = async () => {
		amount = a;
		amountFiat = af;

		({ hash } = await post(`/${subject.username}/invoice`, {
			invoice: {
				amount,
				rate: rates[subject.currency],
				type: 'internal'
			},
			user: subject
		}));
	};

	let loading;
	let submit = () => (loading = true);

	$: update(form);
	let update = () => {
		if (form?.message.includes('pin')) $pin = undefined;
		loading = false;
	};
</script>

<AppHeader {data} />

{#if form?.message}
	<div class="text-red-600 text-center">
		{form.message}
	</div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-8">
	{#if amount}
		<h1 class="text-center text-3xl md:text-4xl font-bold mb-6">Sending</h1>
		<div class="text-center mb-8">
			<h2 class="text-2xl md:text-3xl font-semibold">
				{f(amountFiat, currency)}
			</h2>
			<h3 class="text-secondary md:text-lg mb-6 mt-1">{sat(amount)}</h3>
		</div>
	{:else}
		<Numpad bind:amount={a} bind:amountFiat={af} {currency} bind:fiat />
	{/if}

	<form method="POST" use:enhance on:submit={submit}>
		<input name="amount" value={amount} type="hidden" />
		<input name="username" value={subject.username} type="hidden" />
		<input name="confirmed" value={form?.confirm} type="hidden" />
		<input name="pin" value={$pin} type="hidden" />
		<input name="hash" value={hash} type="hidden" />

		<div class="flex w-full">
			{#if amount}
				<button
					type="submit"
					class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
				>
					{#if loading}
						<Spinner />
					{:else}
						{$t('payments.send')}
					{/if}
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
