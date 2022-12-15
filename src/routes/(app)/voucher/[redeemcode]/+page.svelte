<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Avatar, Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';
	import { copy, f, s, sat, sats } from '$lib/utils';
	import { loginRedirect, selectedRate } from '$lib/store';

	export let data;
	let { src } = data;
	$: ({ amount, currency, rate, redeemed, redeemcode, user, redeemer } = data.payment);

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
			{#if !redeemed}
				<img
					{src}
					class="w-[300px] mx-auto cursor-pointer"
					on:click={() => copy(redeemcode)}
					alt="Redeem Code"
				/>
			{/if}
			<div class="flex justify-center gap-4">
				<div class="my-auto">
					<h2 class="text-2xl md:text-3xl font-semibold">
						{f(amountFiat, currency)}
					</h2>
					<h3 class="text-secondary md:text-lg mt-1">
						{sat(amount)}
					</h3>
				</div>
				<div class="my-auto">{$t('transactions.from')}</div>
				<div class="flex">
					<Avatar {user} size={20} />
					<div class="my-auto">{user.username}</div>
				</div>
			</div>
			<div class="mx-auto my-auto flex gap-2 justify-center" data-sveltekit-prefetch="off">
				{#if redeemer}
					<div class="my-auto">{$t('transactions.redeemedBy')}</div>
					<div class="flex">
						<Avatar user={redeemer} size={20} />
						<div class="my-auto">{redeemer.username}</div>
					</div>
				{:else}
					<form
						method="POST"
						use:enhance
						on:submit={() => ($loginRedirect = `/redeem/${redeemcode}`)}
					>
						<button
							type="submit"
							class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80"
							class:bg-gray-200={redeemed}
							disabled={$loginRedirect || redeemed}
						>
							{redeemed ? $t('transactions.redeemed') : $t('transactions.redeem')}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
