<script>
	import { AppHeader } from '$comp';
	import { user } from '$lib/store';

	$: transactions = $user.payments;
</script>

{#if $user}
	<AppHeader />

	<div class="my-20">
		<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
			Transaction History
		</h1>

		<div class="max-w-5xl w-11/12 md:w-3/4 xl:w-1/2 mx-auto md:text-lg">
			<div class="text-secondary flex justify-between mb-5">
				<h2>AMOUNT</h2>
				<h2>TIME</h2>
			</div>

			<div class="space-y-10">
				{#if transactions.length}
					{#each transactions as tx}
						<div class="flex justify-between items-center border-b pb-5">
							<div class="font-bold">
								<span class="block mb-1"
									>{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD'
									}).format(tx.amount * (tx.rate / 100000000))}
								</span>

								<span class="text-secondary"
									>({new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(tx.amount)}
									SATS)
								</span>
							</div>

							<div class="text-secondary">
								{new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
							</div>
						</div>
					{/each}
				{:else}
					<p class="text-secondary text-lg text-center">No transactions yet.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
