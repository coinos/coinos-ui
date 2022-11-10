<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';
	import { copy, f, s, sat, sats } from '$lib/utils';
	import { loginRedirect, selectedRate } from '$lib/store';

	export let data;
	let { src } = data;
	$: ({ amount, currency, rate, redeemed, redeemcode, user } = data.payment);
	onMount(() => ($loginRedirect = $page.url.pathname));

	toast.pop(0);

	$: amountFiat = parseFloat(((-amount * rate) / sats).toFixed(2));
</script>

<div class="container px-4 max-w-lg mx-auto mt-10 space-y-5">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center text-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<h1 class="text-3xl md:text-4xl font-bold">Voucher</h1>

			<img
				{src}
				class="w-[300px] mx-auto cursor-pointer"
				on:click={() => copy(redeemcode)}
				alt="Redeem Code"
			/>
			<div>
				<h2 class="text-2xl md:text-3xl font-semibold">
					{f(amountFiat, currency)}
				</h2>
				<h3 class="text-secondary md:text-lg mb-6 mt-1">
					{sat(amount)}
				</h3>
			</div>
			<div class="mx-auto my-auto flex gap-2 justify-center" data-sveltekit-prefetch="off">
				<a href={`/redeem/${redeemcode}`}>
					<button
						class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80"
						class:bg-gray-200={redeemed}
						disabled={redeemed}
					>
						{redeemed ? 'Redeemed' : 'Redeem'}
					</button>
				</a>
			</div>
		</div>
	</div>
</div>
