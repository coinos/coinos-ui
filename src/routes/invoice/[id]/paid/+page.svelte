<script>
	import { toast } from '@zerodevx/svelte-toast';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { f, s } from '$lib/utils';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { goto } from '$app/navigation';
	import { invoices } from '$lib/store';

	export let data;
	let { invoice } = data;
  toast.pop(0);

	const handleDoneClick = () => {
		delete $invoices[invoice.uuid];
		goto(`/${invoice.user.username}/receive`);
	};
</script>

<div class="text-center mt-20 md:mt-0">
	{#if browser}
		<div class="w-full mx-auto max-w-xl">
			<LottiePlayer
				src="/lottie/success.json"
				autoplay={true}
				loop={true}
				controls={false}
				renderer="svg"
				background="transparent"
			/>
		</div>
	{/if}
	<h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('invoice.paymentSuccessful')}</h1>
	<h2 class="text-2xl md:text-3xl font-semibold">
		{f(invoice.amount, invoice.currency)}
	</h2>
	<h3 class="text-secondary md:text-lg mb-6 mt-1">({s(invoice.amount)} SAT)</h3>
	<button
		class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80"
		on:click={handleDoneClick}
	>
		{$t('invoice.done')}
	</button>
</div>
