<script>
	import { tick } from 'svelte';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Toggle, Slider, Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { fiat as toFiat, f, back, s, sat } from '$lib/utils';
	import { pin, selectedRate } from '$lib/store';

	export let data;
	export let form;

	let { address, amount } = $page.params;
	let { balance, currency } = data.user;
	let loading, submit, fiat, confirmed, feeRate, min, max, fee, ourfee, stale, subtract, adjusting;

	let toggle = () => (loading = true);
	let toggleAdjusting = () => (adjusting = !adjusting);

	$: update(form);
	let update = () => {
		loading = false;
		if (form?.message?.includes('pin')) $pin = undefined;
		if (form) ({ min, max, feeRate, fee, ourfee, subtract } = form);
		if (!ourfee) ourfee = 0;
		if (feeRate) confirmed = true;
		stale = false;
	};

	let setMax = () => {
		fiat = false;
		amount = balance;
		subtract = true;
	};

	$: if (amount + fee > balance) subtract = true;

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

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-5 text-center">
	<h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t('payments.send')}</h1>

	<div class="text-lg text-secondary break-all">{address}</div>

	{#if confirmed}
		<div class="text-center">
			<h2 class="text-2xl md:text-3xl font-semibold">
				{f(toFiat(amount, $selectedRate), currency)}
			</h2>
			<h3 class="text-secondary md:text-lg mb-6 mt-1">⚡️{s(amount)}</h3>
		</div>

		<div class="text-center">
			<h2 class="text-secondary mb-5 text-lg">with fee</h2>

			<div class="relative">
				<h2 class="text-xl font-semibold">
					{f(toFiat(fee + ourfee, $selectedRate), currency)}
				</h2>
				<h3 class="text-secondary mb-6 mt-1">⚡️{s(fee + ourfee)}</h3>
				<button class="absolute right-1/4 top-0 text-secondary p-4" on:click={toggleAdjusting}
					><Icon icon="settings" style="opacity-30" /></button
				>
			</div>
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
		<input name="subtract" value={subtract} type="hidden" />

		{#if confirmed && adjusting}
			<div class="relative mt-10 mb-20">
				<div class="absolute top-5 left-0 text-secondary">Slower (~40 blocks)</div>
				<div class="absolute top-5 right-0 text-secondary">Faster (~1 block)</div>
				<Slider bind:value={feeRate} {handle} {min} {max} />
			</div>
			<div class="flex justify-center gap-2 mb-10">
				<div class="my-auto">
					<Toggle id="subtract" checked={subtract} bind:value={subtract} />
				</div>
				<label for="subtract" class="text-secondary text-lg my-auto mb-2"
					>Take fee from amount</label
				>
			</div>
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
				{#if confirmed}
					{$t('payments.send')}
				{:else}
					{$t('payments.next')}
				{/if}
			</button>
		</div>
	</form>
</div>
