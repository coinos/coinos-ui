<script>
	import { scale } from 'svelte/transition';
	import { Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { f, s, sat, sats } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { invoices } from '$lib/store';

	export let data;
	let amount, currency, rate, received, pending, tip, user, uuid;
	$: data && ({ amount, currency, rate, received, pending, tip, user, uuid } = data.invoice);

	toast.pop(0);

	$: amountFiat = parseFloat((((received - tip) * rate) / sats).toFixed(2));
	$: pendingFiat = parseFloat((((pending - tip) * rate) / sats).toFixed(2));
	$: tipFiat = parseFloat(((tip * rate) / sats).toFixed(2));
</script>

<div class="container px-4 text-center mx-auto">
	<div class="flex w-full py-20 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>
	{#if received}
		<h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('invoice.paymentSuccessful')}</h1>
		<h2 class="text-2xl md:text-3xl font-semibold">
			{f(amountFiat, currency)}
			{#if tip}
				+ {f(tipFiat, currency)}
			{/if}
		</h2>
		<h3 class="text-secondary md:text-lg mb-6 mt-1">
			{sat(received - tip)}
			{#if tip}
				+{sat(tip)}
			{/if}
		</h3>
	{/if}

	{#if pending}
		<h1 class="text-3xl md:text-4xl font-bold mb-6">Payment detected</h1>
		<h2 class="text-2xl md:text-3xl font-semibold">
			{f(pendingFiat, currency)}
			{#if tip}
				+ {f(tipFiat, currency)}
			{/if}
		</h2>
		<h3 class="text-secondary md:text-lg mb-6 mt-1">
			{sat(pending - tip)}
			{#if tip}
				+{sat(tip)}
			{/if}
		</h3>
	{/if}
</div>

<a href={`/${user.username}/receive`}>
	<div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>
