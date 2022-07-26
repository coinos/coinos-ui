<script>
	// in the future we will want to allow users to set their fiat currency in the settings
	import { AppHeader, Icon } from '$comp';
	import { goto } from '$app/navigation';

	let useFiat = true;
	let amountFiat = 0;
	let amountSats = 0;

	const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];
</script>

<AppHeader />

<!-- step 1 input amount and generate QR code -->
<div class="flex justify-center items-center mt-20 mb-3 px-3">
	<div class="space-y-5">
		<!-- amounts -->
		<div class="text-center">
			<div class="text-6xl font-semibold tracking-widest mb-1">
				{useFiat ? `$${amountFiat}` : amountSats}<span class="tracking-normal text-base font-normal"
					>{useFiat ? 'CAD' : 'SATS'}</span
				>
			</div>
			<span class="text-secondary mr-1"
				>{useFiat ? `${amountSats} SATS` : `$${amountFiat} CAD`}</span
			> <button on:click={() => (useFiat = !useFiat)}><Icon icon="swap" style="inline" /></button>
		</div>

		<!-- numpad -->
		<div class="grid grid-cols-3 gap-2">
			{#each numPad as value}
				{#if value === '<'}
					<button
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white"
					>
						<svg
							class="w-5"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M15 19L8 12L15 5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg></button
					>
				{:else}
					<button
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white"
						>{value}</button
					>
				{/if}
			{/each}
		</div>

		<!-- buttons -->
		<div class="space-y-3">
			<button
				class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm"
				on:click={() => goto('/invoice')}><Icon icon="qr" style="mr-2" /> Show QR</button
			>
			<button
				class="bg-primary rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm"
				><Icon icon="send" style="mr-2" /> Send Invoice</button
			>
		</div>
	</div>
</div>
