<script>
	import { send } from '$lib/socket';
	import { back, copy, f, get, sat, reverseFormat, s, sats } from '$lib/utils';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { invoices, last } from '$lib/store';
	import { Icon, Heart, Image, Qr } from '$comp';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

	export let data;
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

<div class="container mx-auto max-w-lg px-4 space-y-10 lg:space-y-0">
	<div class="space-y-10 lg:space-y-0">
		<div class="text-center">
			<span class="text-secondary block text-2xl break-all"
				>Scan to pay <a href="/{username}" class="text-black font-semibold hover:opacity-80"
					>{username}</a
				></span
			>

			<Qr {src} />

			<div class="mb-10">
				<button
					class="flex rounded-full border py-2 px-5 font-bold hover:opacity-80 mb-2 mx-auto"
					on:click={() => copy(text)}
					><Icon icon="copy" style="mr-1" />
					<div>Copy</div></button
				>
			</div>

			<div class="px-5 space-y-3 w-80 mx-auto">
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

				<div class="flex flex-wrap justify-between font-bold">
					<span class="mr-1">{$t('invoice.total')}</span>
					<span
						>{f(amountFiat + parseFloat(tipAmount), currency)}
						<span class="text-secondary font-normal">{`${sat(tip + amount)}`}</span></span
					>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.full-shadow {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
	}
</style>
