<script>
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back, s } from '$lib/utils';
	import { pin } from '$lib/store';

	export let data;
	export let form;

	let { payreq } = $page.params;
	let { alias } = data;

	let { currency } = data.user;
	let amount = form?.amount || data.amount;
	let a;

	let loading;
	let submit = () => (loading = true);
	$: update(form);
	let update = () => {
		if (form?.message?.includes('pin')) $pin = undefined;
		loading = false;
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

{#if form?.message}
	<div class="text-red-600 text-center">
		{form.message}
	</div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
	{#if amount}
		<div class="text-center mb-8">
			<h1 class="text-xl md:text-2xl text-secondary mb-2">{$t('payments.send')}</h1>
			<p class="text-6xl break-words mb-4">
				{s(amount)} <span class="text-xl md:text-2xl text-secondary">sats</span>
			</p>
			<h1 class="text-xl md:text-2xl text-secondary mb-2">{$t('payments.to')}</h1>
			<p class="text-6xl break-words">{alias}</p>
		</div>

		<form method="POST" use:enhance on:submit={submit} action="?/send">
			<input name="payreq" value={payreq} type="hidden" />
			<input name="amount" value={amount} type="hidden" />
			<input name="confirmed" value={form?.confirm} type="hidden" />
			<input name="pin" value={$pin} type="hidden" />

			<div class="flex w-full">
				<button
					type="submit"
					class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
					disabled={loading}
				>
					{#if loading}
						<Spinner />
					{:else}
						{$t('payments.send')}
					{/if}
				</button>
			</div>
		</form>
	{:else}
		<form method="POST" action="?/setAmount" class="w-[300px] mx-auto">
			<input type="hidden" value={a} name="amount" />
			<Numpad bind:amount={a} {currency} />
			<button
				type="submit"
				class="bg-black text-white rounded-xl h-[48px] flex w-full justify-center items-center font-semibold
				opacity-100 hover:opacity-80"
			>
				Next
			</button>
		</form>
	{/if}
</div>
