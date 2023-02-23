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
	let a;
	let maxfee = 100;

	$: amount = form?.amount || data.amount;

	let loading;
	let submit = () => (loading = true);
	$: update(form);
	let update = () => {
		if (form?.message?.includes('pin')) $pin = undefined;
		loading = false;
	};

	let show;
	let toggle = () => (show = !show);
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
				⚡️{s(amount)}
			</p>
			<h1 class="text-xl md:text-2xl text-secondary mb-2">{$t('payments.to')}</h1>
			<p class="text-4xl break-words">{alias}</p>
		</div>

		<form method="POST" use:enhance on:submit={submit} action="?/send" class="space-y-5">
			<input name="payreq" value={payreq} type="hidden" />
			<input name="amount" value={amount} type="hidden" />
			<input name="pin" value={$pin} type="hidden" />
			<input name="maxfee" value={maxfee} type="hidden" />

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

		{#if show}
			<div class="relative w-96 mx-auto">
				<label for="maxfee">Max fee</label>
				<input name="maxfee" value={maxfee} />

				<div
					class="absolute right-[2px] top-[25px] text-gray-600 rounded-r-2xl p-4 h-[54px] my-auto border-l "
				>
					⚡️
				</div>
			</div>
		{:else}
			<div class="flex w-full mt-5">
				<button class="mx-auto" on:click={toggle}>Settings</button>
			</div>
		{/if}
	{:else}
		<form method="POST" action="?/setAmount" class="w-[300px] mx-auto" use:enhance>
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
