<script>
  import { Icon } from "$comp";
	import { selectedRate, user } from '$lib/store';
	import { f, s, post, warning, sats } from '$lib/utils';
	import { t } from '$lib/translations';

	export let amount, currency;

	let useFiat = true;
	let amountFiat = 0;
	let amountSats = 0;
	let loading = false;

	let symbol =
		{
			USD: '$',
			CAD: '$',
			AUD: '$',
			NZD: '$',
			MXN: '$',
			BRL: '$',
			HKD: '$',
			TWD: '$',
			JPY: '¥',
			CNY: '¥',
			GBP: '£',
			EUR: '€',
			KRW: '₩'
		}[currency] || '';

	$: amount = parseInt(useFiat ? Math.round(amountFiat / ($selectedRate / sats)) : amountSats);

	$: amountSatsFormatted = s(amountSats);

	$: amountFiatConverted = f(amountSats * ($selectedRate / sats), $user.currency);

	$: amountSatsConverted = s(amountFiat / ($selectedRate / sats));

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
			} else if (value !== '<' && parseInt(amountSats + value) > sats) {
				warning($t('user.receive.lessThan1BTCWarning'));
			} else {
				amountSats = parseInt(amountSats + value);
			}
		}
	};
</script>

<div class="flex justify-center items-center mb-3 px-3">
	{#if $selectedRate}
		<div class="space-y-5">
			<!-- amounts -->
			<div class="text-center">
				<div class="text-5xl md:text-6xl font-semibold tracking-widest mb-1">
					{useFiat ? `${symbol}${amountFiat}` : amountSatsFormatted}<span
						class="tracking-normal text-base font-normal">{useFiat ? $user.currency : 'SAT'}</span
					>
				</div>
				<span class="text-secondary mr-1"
					>{useFiat ? `${amountSatsConverted} SAT` : amountFiatConverted}</span
				>
				<button
					on:click={() => {
						if (useFiat) {
							amountSats = parseInt((amountFiat / ($selectedRate / sats)).toFixed(0));
						} else {
							amountFiat =
								(amountSats * ($selectedRate / sats)).toFixed(2) > 0.0
									? (amountSats * ($selectedRate / sats)).toFixed(2)
									: 0;
						}
						useFiat = !useFiat;
					}}><Icon icon="swap" style="inline hover:opacity-80" /></button
				>
			</div>

			<!-- numpad -->
			<div class="grid grid-cols-3 gap-2 w-full md:w-[300px] mx-auto">
				{#each numPad as value}
					{#if value === '<'}
						<button
							class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white flex justify-center items-center hover:opacity-80"
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
							class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white hover:opacity-80"
							on:click={() => handleInput(value)}>{value}</button
						>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<div class="w-full md:w-[300px] h-[475px] md:h-[485px] animate-pulse bg-gray-400 rounded-xl" />
	{/if}
</div>
