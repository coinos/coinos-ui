<script>
	// in the future we will want to allow users to set their fiat currency in the settings
	import { AppHeader, Icon } from '$comp';
	import { goto } from '$app/navigation';
	import { invoiceAmount, invoiceAmountFiat, selectedRate, user } from '$lib/store';
	import { post, warning } from '$lib/utils';
	import { page } from '$app/stores';
	import { _, number } from 'svelte-i18n';

	let useFiat = true;
	let amountFiat = 0;
	let amountSats = 0;

	$: amount = useFiat ? Math.round(amountFiat / ($selectedRate / 100000000)) : amountSats;

	$: $invoiceAmount = parseInt(
		amountSats === 0 ? amountFiat / ($selectedRate / 100000000) : amountSats
	);
	$: $invoiceAmountFiat = parseInt(
		amountFiat === 0 ? amountSats * ($selectedRate / 100000000) : amountFiat
	);
	$: amountSatsFormatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		amountSats
	);

	$: amountFiatConverted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: $user.currency
	}).format(amountSats * ($selectedRate / 100000000));

	$: amountSatsConverted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		amountFiat / ($selectedRate / 100000000)
	);

	const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];

	const handleInput = (value) => {
		if (useFiat) {
			if (amountFiat === 0 && value !== '.' && value !== '<' && value !== '0') {
				amountFiat = value;
			} else if ((amountFiat === 0 || amountFiat === '0') && value === '0') {
				return;
			} else if (amountFiat === 0 && value === '.') {
				amountFiat = '0.';
			} else if (amountFiat !== 0 && amountFiat.includes('.') && value === '.') {
				return;
			} else if (value === '<') {
				if (amountFiat !== 0) {
					amountFiat = amountFiat.slice(0, amountFiat.length - 1);
					if (amountFiat.length === 0) {
						amountFiat = 0;
						amountSats = 0;
					}
				}
			} else if (value !== '.' && value !== '<' && parseInt(amountFiat + value) > $selectedRate) {
				warning($_('user.receive.lessThan1BTCWarning'));
			} else if (amountFiat !== 0 && amountFiat.match(/\.../)) {
				return;
			} else {
				amountFiat = amountFiat + value;
			}
		} else {
			if (value === '.') {
				return;
			} else if (amountSats === '0' && value !== '<' && value !== '0') {
				amountSats = value;
			} else if (value === '<') {
				if (amountSats !== 0) {
					amountSats = amountSats.slice(0, amountSats.length - 1);
					if (amountSats.length === 0) {
						amountSats = 0;
						amountFiat = 0;
					}
				}
			} else if (value !== '<' && parseInt(amountSats + value) > 100000000) {
				warning($_('user.receive.lessThan1BTCWarning'));
			} else {
				amountSats = amountSats + value;
			}
		}
	};

	let submit = async () => {
		let { id } = await post('/invoice', {
			amount,
			rate: $selectedRate,
			username: $page.params.username
		});
		goto(`/invoice/${id}`);
	};
</script>

{#if $user}
	<AppHeader />

	<div class="flex justify-center items-center mt-20 mb-3 px-3">
		{#if $selectedRate}
			<div class="space-y-5">
				<!-- amounts -->
				<div class="text-center">
					<div class="text-5xl md:text-6xl font-semibold tracking-widest mb-1">
						{useFiat
							? `${
									$user.currency === 'USD' ||
									$user.currency === 'CAD' ||
									$user.currency === 'AUD' ||
									$user.currency === 'NZD' ||
									$user.currency === 'MXN' ||
									$user.currency === 'BRL' ||
									$user.currency === 'HKD' ||
									$user.currency === 'TWD'
										? '$'
										: $user.currency === 'JPY' || $user.currency === 'CNY'
										? '¥'
										: $user.currency === 'GBP'
										? '£'
										: $user.currency === 'EUR'
										? '€'
										: $user.currency === 'KRW'
										? '₩'
										: ''
							  }${amountFiat}`
							: amountSatsFormatted}<span class="tracking-normal text-base font-normal"
							>{useFiat ? $user.currency : 'SAT'}</span
						>
					</div>
					<span class="text-secondary mr-1"
						>{useFiat ? `${amountSatsConverted} SAT` : amountFiatConverted}</span
					>
					<button
						on:click={() => {
							if (useFiat) {
								amountSats = (amountFiat / ($selectedRate / 100000000)).toFixed(0).toString();
							} else {
								amountFiat =
									(amountSats * ($selectedRate / 100000000)).toFixed(2) > 0.0
										? (amountSats * ($selectedRate / 100000000)).toFixed(2).toString()
										: 0;
							}
							useFiat = !useFiat;
						}}><Icon icon="swap" style="inline" /></button
					>
				</div>

				<!-- numpad -->
				<div class="grid grid-cols-3 gap-2 w-full md:w-[300px] mx-auto">
					{#each numPad as value}
						{#if value === '<'}
							<button
								class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white flex justify-center items-center"
								on:click={() => handleInput(value)}
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
								</svg>
							</button>
						{:else}
							<button
								class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white"
								on:click={() => handleInput(value)}>{value}</button
							>
						{/if}
					{/each}
				</div>

				<!-- buttons -->
				<div class="space-y-3 w-full md:w-[300px] mx-auto">
					<button
						class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm {$invoiceAmount ===
						0
							? 'opacity-50'
							: 'opacity-100'}"
						on:click={submit}
						disabled={$invoiceAmount === 0}
						><Icon icon="qr" style="mr-2" /> {$_('user.receive.showQR')}</button
					>
					<!--
					<button
						class="bg-primary rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm"
						disabled={true}><Icon icon="send" style="mr-2" /> Send Invoice</button
					>
          -->
				</div>
			</div>
		{:else}
			<div
				class="w-full md:w-[300px] h-[475px] md:h-[485px] animate-pulse bg-gray-400 rounded-xl"
			/>
		{/if}
	</div>
{/if}
