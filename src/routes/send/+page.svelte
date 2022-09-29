<script>
	import { t } from '$lib/translations';
	import { AppHeader, Icon, Spinner } from '$comp';

	let payreq = '',
		loading,
		payreqField;

	let withdraw = async () => {
		loading = true;
		try {
			await post('/withdraw', { payreq });
			loading = false;
		} catch (e) {
			failure(e.message);
			loading = false;
		}
	};
</script>

<AppHeader avatarPosition="left-[calc(50vw-64px)] lg:left-[calc(15vw-64px)]" />

<div class="container px-4 mt-20 max-w-xl mx-auto">
	<div>
		<!-- found missing translation -->
		<label for="invoice" class="font-bold mb-1 block"
			>Destination <small class="text-secondary">Address, Invoice, User, Email or Phone</small
			></label
		>

		<div class="relative">
			<input
				bind:this={payreqField}
				type="text"
				name="payreq"
				required
				bind:value={payreq}
				class="block rounded-2xl p-3 w-full bg-primary"
			/>

			<a href="/scan">
				<div class="flex absolute h-[48px] right-0 top-0 px-2 mt-[1px]">
					<Icon icon="scan" style="mr-2 w-6 my-auto" />
				</div>
			</a>
		</div>
	</div>

	<button
		disabled={!payreq}
		class="{!payreq
			? 'opacity-50'
			: 'opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold w-full mt-2 bg-black text-white"
		on:click={withdraw}
	>
		{#if loading}
			<Spinner />
		{:else}
			{$t('user.dashboard.go')}
		{/if}
	</button>
</div>
