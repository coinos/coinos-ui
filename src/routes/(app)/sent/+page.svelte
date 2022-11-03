<script>
	import { f, s, sats } from '$lib/utils';
	import { scale } from 'svelte/transition';
	import { Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';

	export let data;
	let { user } = data;

	let payment = user.payments[0];
	let { amount, rate } = payment;
	amount = Math.abs(amount);

	let fiat = (amount * rate) / sats;

	toast.pop(0);
</script>

<div class="text-center mt-20 md:mt-0">
	<div class="flex w-full max-w-[200px] mx-auto py-20" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>
	<h1 class="text-3xl md:text-4xl font-bold mb-6">Sent!</h1>
	<h2 class="text-2xl md:text-3xl font-semibold">
		{f(fiat, user.currency)}
	</h2>
	<h3 class="text-secondary md:text-lg mb-6 mt-1">({s(amount)} SAT)</h3>
	<a href={`/${user.username}/transactions`}>
		<button class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80">
			{$t('invoice.done')}
		</button>
	</a>
</div>
