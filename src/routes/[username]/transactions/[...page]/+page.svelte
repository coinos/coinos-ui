<script>
	import { AppHeader } from '$comp';
	import { newPayment } from '$lib/store';
	import { t } from '$lib/translations';
	import { f, s } from '$lib/utils';
	export let data;

	let { user } = data;

	$newPayment = false;
	let page,
		total,
		transactions = [],
		pages = [];
	$: data && ({ page, pages, total, transactions } = data);
</script>

<AppHeader />

<div class="my-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t('user.transactions.header')}
	</h1>

	<div class="container w-full mx-auto flex px-10 lg:px-40 mb-8 text-right">
		<div class="ml-auto flex flex-wrap">
			{#if pages.length > 1}
				{#each pages as _, i}
					<a href={`/${user.username}/transactions/${i + 1}`} class:active={page === i + 1}>
						<div class="border py-4 px-6 border-r-0 last:border-r hover:bg-primary">
							{i + 1}
						</div>
					</a>
				{/each}
			{/if}
		</div>
	</div>

	<div class="container w-full mx-auto md:text-lg px-10 lg:px-40">
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
								>{tx.amount > 0 ? '+' : ''}{f(tx.amount * (tx.rate / 100000000), tx.currency)}
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
							{new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
	.active {
		@apply font-bold;
	}
</style>
