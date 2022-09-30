<script>
	import { toast } from '@zerodevx/svelte-toast';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { goto } from '$app/navigation';

	export let data;
	let { user } = data;

	toast.pop(0);

	const done = () => {
		goto(`/${user.username}/transactions`);
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
	<button
		class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80"
		on:click={done}
	>
		{$t('invoice.done')}
	</button>
</div>
