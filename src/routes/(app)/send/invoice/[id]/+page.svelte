<script>
	import { onDestroy, onMount } from 'svelte';
	import { t } from '$lib/translations';
	import { goto } from '$app/navigation';
	import { pin } from '$lib/store';
	import { enhance } from '$app/forms';
	import { Avatar, Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back, f, fiat as toFiat, s, sats } from '$lib/utils';
	export let data;
	export let form;

	let { address, rate, payreq, recipient, tip, rates, user } = data;
	let { currency } = user;

	let amount = form?.amount || data.amount;
	let a,
		af,
		amountFiat = amount * (rate / sats),
		fiat = !amount;

	let setAmount = () => {
		amount = a;
		amountFiat = af;
	};

	let loading;
	let submit = () => (loading = true);

	$: rate = data.rate * (rates[user.currency] / rates[data.currency]);

	$: update(form);
	let update = () => {
		if (form?.message.includes('pin')) $pin = undefined;
		loading = false;
	};

	// onMount(async () => {
	// 	if (browser && window.NDEFReader) {
	// 		try {
	// 			let ndef = new NDEFReader();
	// 			await ndef.scan();
  //
	// 			ndef.addEventListener('readingerror', (e) => {
	// 				console.log('nfc error', e);
	// 			});
  //
	// 			ndef.addEventListener('reading', ({ message, serialNumber }) => {
	// 				console.log(message, serialNumber);
	// 			});
	// 		} catch (e) {
	// 			console.log('NFC error', e);
	// 		}
	// 	}
	// });
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
			<h1 class="text-xl md:text-2xl text-secondary mb-2">
				{$t('payments.send')}
			</h1>
			<h2 class="text-2xl md:text-3xl font-semibold">
				{f(toFiat(amount, rate), currency)}
				{#if tip}
					<span class="text-lg">
						+ {f(toFiat(tip, rate), currency)}
					</span>
				{/if}
			</h2>
			<h3 class="text-secondary md:text-lg mb-6 mt-1">
				⚡️{s(amount)}

				{#if tip}
					<span class="text-lg">
						+ ⚡️{s(tip)}
					</span>
				{/if}
			</h3>

			<h1 class="text-xl md:text-2xl text-secondary mb-2">{$t('payments.to')}</h1>

			<div class="flex p-1 gap-2 justify-center">
				<Avatar user={recipient} size={'20'} />
				<p class="text-4xl break-words my-auto">{recipient.username}</p>
			</div>
		</div>
	{:else}
		<Numpad bind:amount={a} bind:amountFiat={af} {currency} bind:fiat bind:rate />
	{/if}

	<form method="POST" use:enhance on:submit={submit}>
		<input name="address" value={address} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<input name="payreq" value={payreq} type="hidden" />
		<input name="username" value={recipient.username} type="hidden" />
		<input name="pin" value={$pin} type="hidden" />

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
					{$t('payments.next')}
				</button>
			{/if}
		</div>
	</form>
</div>
