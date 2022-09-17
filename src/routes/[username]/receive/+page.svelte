<script>
	import { AppHeader, Icon } from '$comp';
	import { goto } from '$app/navigation';
	import { invoiceAmount, invoiceAmountFiat, selectedRate, user } from '$lib/store';
	import { f, s, post, warning } from '$lib/utils';
	import { page } from '$app/stores';
	import { t } from '$lib/translations';

	let useFiat = true;
	let amountFiat = 0;
	let amountSats = 0;
	let loading = false;

	$: amount = parseInt(useFiat ? Math.round(amountFiat / ($selectedRate / 100000000)) : amountSats);

	$: $invoiceAmount = parseInt(!amountSats ? amountFiat / ($selectedRate / 100000000) : amountSats);

	$: $invoiceAmountFiat = parseInt(
		amountFiat === 0 ? amountSats * ($selectedRate / 100000000) : amountFiat
	);

	$: amountSatsFormatted = s(amountSats);

	$: amountFiatConverted = f(amountSats * ($selectedRate / 100000000), $user.currency);

	$: amountSatsConverted = s(amountFiat / ($selectedRate / 100000000));

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
				warning($t('user.receive.lessThan1BTCWarning'));
			} else if (amountFiat !== 0 && amountFiat.match(/\.../)) {
				return;
			} else {
				amountFiat = amountFiat + value;
			}
		} else {
			if (value === '.') {
				return;
			} else if (!amountSats && value !== '<' && value !== '0') {
				amountSats = parseInt(value);
			} else if (value === '<') {
				if (amountSats !== 0) {
					amountSats = Math.floor(amountSats / 10);
					if (amountSats.length === 0) {
						amountSats = 0;
						amountFiat = 0;
					}
				}
			} else if (value !== '<' && parseInt(amountSats + value) > 100000000) {
				warning($t('user.receive.lessThan1BTCWarning'));
			} else {
				amountSats = parseInt(amountSats + value);
			}
		}
	};

	let submit = async () => {
		loading = true;
		let id = await post('/invoice', {
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
								amountSats = parseInt((amountFiat / ($selectedRate / 100000000)).toFixed(0));
							} else {
								amountFiat =
									(amountSats * ($selectedRate / 100000000)).toFixed(2) > 0.0
										? (amountSats * ($selectedRate / 100000000)).toFixed(2)
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

				<div class="space-y-3 w-full md:w-[300px] mx-auto">
					<button
						class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm {$invoiceAmount ===
							0 || loading
							? 'opacity-50'
							: 'opacity-100'}"
						on:click={submit}
						disabled={$invoiceAmount === 0 || loading}
					>
						{#if loading}
							<svg
								class="mx-auto h-6 w-6 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						{:else}
							<Icon icon="qr" style="mr-2" /> {$t('user.receive.showQR')}
						{/if}
					</button>
				</div>
			</div>
		{:else}
			<div
				class="w-full md:w-[300px] h-[475px] md:h-[485px] animate-pulse bg-gray-400 rounded-xl"
			/>
		{/if}
	</div>
{/if}
