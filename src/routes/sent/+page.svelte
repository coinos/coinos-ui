<script>
	import { Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';

	export let data;
	let { user } = data;

	toast.pop(0);
</script>

<div class="text-center mt-20 md:mt-0">
	<div class="flex w-full py-20">
		<Icon icon="check" style="mx-auto" />
	</div>
	<h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('invoice.paymentSuccessful')}</h1>
  <a href={`/${user.username}/transactions`}>
	<button
		class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80"
	>
		{$t('invoice.done')}
	</button>
    </a>
</div>
