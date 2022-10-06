<script>
  import { onMount } from "svelte";
	import { formatDistance, parseISO } from 'date-fns';
	import { newPayment } from '$lib/store';
	import { t } from '$lib/translations';
	import { f, s, sats } from '$lib/utils';
  import { page } from "$app/stores";

	export let data;

	let { user } = data;

	let p,
		total,
		transactions = [],
		pages = [];
	$: data && ({ page: p, pages, total, transactions } = data);

  $: $page && ($newPayment = false);
  $: $newPayment && invalidate(`/users/${user.username}`);
</script>

<div class="mt-24 mb-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t('user.transactions.header')}
	</h1>

	<div class="container w-full mx-auto md:text-lg px-10 lg:px-72">
		<div class="flex flex-wrap justify-end mb-8">
			{#if pages.length > 1}
				{#each pages as _, i}
					<a
						class="mr-1 last:mr-0"
						href={`/${user.username}/transactions/${i + 1}`}
						class:active={p === i + 1}
					>
						<div class="border py-2 rounded-full border-2 w-12 h-12 hover:opacity-80 text-center">
							{i + 1}
						</div>
					</a>
				{/each}
			{/if}
		</div>

		<div class="text-secondary grid grid-cols-3 mb-5">
			<h2>{$t('user.transactions.AMOUNT')}</h2>
			<h2 class="text-center">{$t('user.transactions.TYPE')}</h2>
			<h2 class="text-right">{$t('user.transactions.TIME')}</h2>
		</div>

		<div class="space-y-10">
			{#if transactions.length}
				{#each transactions as tx}
					<div class="grid grid-cols-3 border-b pb-5">
						<div class="font-bold">
							<span class="block mb-1"
								>{tx.amount > 0 ? '+' : ''}{f(tx.amount * (tx.rate / sats), tx.currency)}
							</span>

							<span class="text-secondary"
								>{tx.amount > 0 ? '+' : ''}{s(tx.amount)}
								SAT
							</span>
						</div>

						<div class="text-center">
							<span class="text-secondary"
								>{$t('user.transactions.' + (tx.amount < 0 ? 'sent' : 'received'))}</span
							>
						</div>

						<div class="text-secondary text-right">
							{formatDistance(parseISO(tx.createdAt), new Date(), {
								includeSeconds: true,
								addSuffix: true
							})}
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-secondary text-lg text-center">{$t('user.transactions.empty')}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.active div {
		@apply bg-gray-100;
	}
</style>
