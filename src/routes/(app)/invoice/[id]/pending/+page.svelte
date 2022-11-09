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
	let { invoice } = data;
	let { pending, currency, rate, tip } = invoice;

	toast.pop(0);

	$: pendingFiat = parseFloat(((pending * rate) / sats).toFixed(2));
	$: tipFiat = parseFloat(((tip * rate) / sats).toFixed(2));

	const handleDoneClick = () => {
		delete $invoices[invoice.uuid];
		goto(`/${invoice.user.username}/receive`);
	};
</script>

<div class="container px-4 text-center mx-auto space-y-5">
	<div class="flex w-full py-20 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>

	<h1 class="text-3xl md:text-4xl font-bold">Payment detected</h1>

	<div>
		<h2 class="text-2xl md:text-3xl font-semibold">
			{f(pendingFiat, currency)}
			{#if tip}
				+ {f(tipFiat, currency)}
			{/if}
		</h2>
		<h3 class="text-secondary md:text-lg mt-1">
			{sat(pending)}
			{#if tip}
				+{sat(tip)}
			{/if}
		</h3>
	</div>

	<p class="text-xl text-red-600">Pending confirmation</p>

	<button
		class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80"
		on:click={handleDoneClick}
	>
		{$t('invoice.done')}
	</button>
</div>
