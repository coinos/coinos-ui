<script>
	import { AppHeader } from '$comp';
	import { user, newPayment } from '$lib/store';
	import { _ } from 'svelte-i18n';

	$newPayment = false;

	$: transactions = $user.payments;
</script>

{#if $user}
	<AppHeader />

	<div class="my-20">
		<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
			{$_('user.transactions.header')}
		</h1>

		<div class="max-w-5xl w-11/12 md:w-3/4 xl:w-1/2 mx-auto md:text-lg">
			<div class="text-secondary grid grid-cols-3 mb-5">
				<h2>{$_('user.transactions.AMOUNT')}</h2>
				<h2 class="text-center">{$_('user.transactions.TYPE')}</h2>
				<h2 class="text-right">{$_('user.transactions.TIME')}</h2>
			</div>

			<div class="space-y-10">
				{#if transactions.length}
					{#each transactions as tx}
						<div class="grid grid-cols-3 border-b pb-5">
							<div class="font-bold">
								<span class="block mb-1"
									>{tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: tx.currency
									}).format(tx.amount * (tx.rate / 100000000))}
								</span>

								<span class="text-secondary"
									>{tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
										maximumFractionDigits: 0
									}).format(tx.amount)}
									SAT
								</span>
							</div>

							<div class="text-center">
								<span class="text-secondary"
									>{$_('user.transactions.' + (tx.amount < 0 ? 'sent' : 'received'))}</span
								>
							</div>

							<div class="text-secondary text-right">
								{new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
							</div>
						</div>
					{/each}
				{:else}
					<p class="text-secondary text-lg text-center">{$_('user.transactions.empty')}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
