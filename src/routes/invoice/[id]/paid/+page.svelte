<script>
	import { scale } from 'svelte/transition';
	import { Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { f, s, sats } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { invoices } from '$lib/store';

	export let data;
	let { invoice } = data;
	let { amount, rate } = invoice;

	toast.pop(0);

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));

	const handleDoneClick = () => {
		delete $invoices[invoice.uuid];
		goto(`/${invoice.user.username}/receive`);
	};
</script>

<div class="container px-4 text-center">
	<div class="flex w-full py-20 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>
	<h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('invoice.paymentSuccessful')}</h1>
	<h2 class="text-2xl md:text-3xl font-semibold">
		{f(amountFiat, invoice.currency)}
	</h2>
	<h3 class="text-secondary md:text-lg mb-6 mt-1">({s(invoice.amount)} SAT)</h3>
	<button
		class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80"
		on:click={handleDoneClick}
	>
		{$t('invoice.done')}
	</button>
</div>
