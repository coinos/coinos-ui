<script>
	import { send } from '$lib/socket';
	import { back, copy, f, get, sat, reverseFormat, s, sats } from '$lib/utils';
	import { tick, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { invoices, last } from '$lib/store';
	import { Avatar, Icon, Heart, Image, Qr } from '$comp';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';
	import screenfull from 'screenfull';

	export let data;

	$: refresh(data);
	let { invoice, id, user, sm, lg } = data;
	let {
		address,
		amount,
		network,
		rate,
		received,
		prompt,
		text,
		tip,
		user: { username, currency }
	} = invoice;

	let showQr = !amount;

	let src = sm;

	let qr;
	let tipPercent = 0;

	let refresh = (data) => {
		({ invoice, id } = data);
		({
			address,
			amount,
			network,
			rate,
			received,
			prompt,
			text,
			tip,
			user: { username, currency }
		} = invoice);

		tipPercent = (tip / amount) * 100;
	};

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
	$: tipAmount = ((tip * rate) / sats).toFixed(2);

	let subbed;
	onMount(() => {
		browser &&
			last.subscribe((v) => {
				if (!v || subbed) return;
				subbed = true;
				send('subscribe', invoice);
			});
	});

	$: link = address ? text : `lightning:${text}`;

	let full;
	let toggle = () => {
		screenfull.toggle(qr);
		full = !full;
		if (full) src = lg;
		else src = sm;
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container mx-auto max-w-lg px-4 space-y-2 sm:space-y-5">
	<div>
		<h1 class="text-secondary text-center text-xl">{$t('transactions.pleasePay')}</h1>

		<div class="flex w-full">
			<div class="mx-auto">
				<a href="/{username}" class="text-black font-semibold hover:opacity-80 mx-auto">
					<div class="flex my-auto">
						<Avatar user={invoice.user} size={20} />
						<div class="my-auto text-lg">{username}</div>
					</div>
				</a>
			</div>
		</div>
	</div>

	<div class="w-full">
		<img {src} class:p-4={full} class="w-[300px] mx-auto" bind:this={qr} on:click={toggle} />
	</div>

	{#if address}
		<div class="text-secondary text-center">{address}</div>
	{/if}

	<div class="flex gap-2 justify-center">
		<button
			class="flex rounded-full border py-2 px-5 font-bold hover:opacity-80"
			on:click={() => copy(address ? address : text)}
			><Icon icon="copy" style="mr-1" />
			<div>Copy</div></button
		>

		{#if user && user.username !== username}
			<a href={`/send/${invoice.uuid}`}>
				<button class="flex rounded-full border py-2 px-5 font-bold hover:opacity-80">
					<Icon icon="send" style="mr-1" />
					<div class="my-auto">Pay</div>
				</button>
			</a>
		{/if}
	</div>

	<div class="space-y-2 w-80 mx-auto">
		{#if invoice.tip}
			<div class="flex justify-between">
				{$t('invoice.invoice')}
				<span>
					{f(amountFiat, currency)}
					<span class="text-secondary">{`${sat(amount)}`}</span>
				</span>
			</div>

			<div class="flex justify-between">
				{$t('invoice.tip')}
				<span
					>{f(tipAmount, currency)}
					<span class="text-secondary">{`${sat(tip)}`}</span>
				</span>
			</div>
		{/if}

		{#if amount > 0}
			<div class="flex flex-wrap justify-between font-bold text-2xl !my-5">
				<span class="mr-1">{$t('invoice.total')}</span>
				<span
					>{f(amountFiat + parseFloat(tipAmount), currency)}
					<span class="text-secondary font-normal">{`${sat(tip + amount)}`}</span></span
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.full {
		@apply p-8;
	}

	.full-shadow {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
	}
</style>
