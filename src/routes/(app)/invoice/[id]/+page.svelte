<script>
	import { send } from '$lib/socket';
	import { back, copy, f, get, sat, reverseFormat, s, sats } from '$lib/utils';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { invoices, last } from '$lib/store';
	import { Avatar, Icon, Heart, Image, Qr } from '$comp';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let data;

	let showQr;

	$: refresh(data);
	let { invoice, id, user, src } = data;
	let {
		amount,
		rate,
		received,
		prompt,
		text,
		tip,
		user: { username, currency }
	} = invoice;

	let tipPercent = 0;

	let refresh = (data) => {
		({ invoice, id } = data);
		({
			amount,
			rate,
			received,
			prompt,
			text,
			tip,
			user: { username, currency }
		} = invoice);

		tipPercent = (tip / amount) * 100;
	};

	$invoices[id] = { amount, id, rate, received, text, tip, username };
	$: browser &&
		$invoices[id]?.received >= $invoices[id]?.amount &&
		goto(($invoices[id].memo === 'launch' && '/launch/purchase') || `/invoice/${id}/paid`);

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
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container mx-auto max-w-lg px-4 space-y-5">
	<h1 class="text-secondary block text-2xl flex">
		<div class="flex mx-auto">
			<div class="my-auto">Please pay</div>

			<div class="my-auto">
				<a href="/{username}" class="text-black font-semibold hover:opacity-80">
					<div class="flex my-auto">
						<Avatar user={username} size={12} />
						<div class="my-auto">{username}</div>
					</div>
				</a>
			</div>
		</div>
	</h1>

	<div class="text-center space-y-5">
		{#if !user || user.username === username || showQr}
			<Qr {src} />

			<div>
				<button
					class="flex rounded-full border py-2 px-5 font-bold hover:opacity-80 mx-auto"
					on:click={() => copy(text)}
					><Icon icon="copy" style="mr-1" />
					<div>Copy</div></button
				>
			</div>
		{/if}

		<div class="px-5 space-y-4 w-80 mx-auto mb-4">
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

			<div class="flex flex-wrap justify-between font-bold text-2xl !my-8">
				<span class="mr-1">{$t('invoice.total')}</span>
				<span
					>{f(amountFiat + parseFloat(tipAmount), currency)}
					<span class="text-secondary font-normal">{`${sat(tip + amount)}`}</span></span
				>
			</div>
		</div>

		{#if user && user.username !== username}
			<div class="mx-auto my-auto flex gap-2 justify-center">
				<a href={`/send/${invoice.uuid}`}>
					<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80">
						Pay now
					</button>
				</a>
				<button
					class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80"
					on:click={() => (showQr = !showQr)}
				>
					{showQr ? 'Hide' : 'Show'} QR
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.full-shadow {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
	}
</style>
