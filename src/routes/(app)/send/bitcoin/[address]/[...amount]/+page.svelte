<script>
	import { tick } from 'svelte';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Slider, Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { fiat as af, f, back, s, sat } from '$lib/utils';
	import { pin, selectedRate } from '$lib/store';

	export let data;
	export let form;

	let { address, amount } = $page.params;
	let { balance, currency } = data.user;
	let loading, submit, fiat, confirmed, feeRate, min, max, fee, stale;

	let toggle = () => (loading = true);

	$: update(form);
	let update = () => {
		loading = false;
		if (form?.message?.includes('pin')) $pin = undefined;
		if (form) ({ min, max, feeRate, fee } = form);
		if (feeRate) confirmed = true;
		stale = false;
	};

	let setMax = () => {
		fiat = false;
		amount = balance;
	};

	let timeout;
	let handle = (e) => {
		stale = true;
		feeRate = e.target.value;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			tick().then(() => submit.click());
		}, 200);
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

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-5">
	<div class="text-center mb-8">
		<h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t('payments.send')}</h1>
		<p class="text-lg text-secondary">{address}</p>
	</div>

	{#if confirmed}
		<div class="text-center">
			<h2 class="text-2xl md:text-3xl font-semibold">
				{f(af(amount, $selectedRate), currency)}
			</h2>
			<h3 class="text-secondary md:text-lg mb-6 mt-1">{sat(amount)}</h3>
		</div>
	{:else}
		<Numpad bind:amount bind:fiat {currency} {submit} />
	{/if}

	<form method="POST" use:enhance on:submit={toggle}>
		<input name="ts" value={Date.now()} type="hidden" />
		<input name="address" value={address} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<input name="pin" value={$pin} type="hidden" />
		<input name="confirmed" value={confirmed} type="hidden" />
		<input name="feeRate" value={feeRate} type="hidden" />
		<input name="stale" value={stale} type="hidden" />

		{#if confirmed}
			<label>Fee rate</label>
			{min}
			{max}
			{fee}
			<div class="text-lg text-center -mb-2 text-secondary">{feeRate} sats/kb</div>
			<Slider bind:value={feeRate} {handle} {min} {max} />
		{/if}

		<div class="flex justify-center gap-2">
			{#if !confirmed}
				<button
					type="button"
					class="hover:opacity-80 bg-black text-white rounded-2xl py-3 px-4 mt-2 border font-bold"
					on:click|preventDefault={setMax}
					on:keydown={setMax}>Max ⚡️{s(balance)}</button
				>
			{/if}

			<button
				bind:this={submit}
				type="submit"
				class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24"
				disabled={loading}
			>
				{#if loading}
					<Spinner />
				{:else if confirmed}
					{$t('payments.send')}
				{:else}
					{$t('payments.next')}
				{/if}
			</button>
		</div>
	</form>
</div>
