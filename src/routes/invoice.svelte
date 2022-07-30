<script>
	import { rate, user, invoiceAmount, invoiceAmountFiat } from '$lib/store';
	import { Icon } from '$comp';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import QRCodeStyling from 'qr-code-styling';

	export let text;

	let tipPercent = 0;
	const setRate = ($invoiceAmountFiat / $invoiceAmount) * 100000000;

	$: tipAmount = customTipAmount
		? customTipAmount < 0
			? (customTipAmount = 0)
			: customTipAmount
		: ($invoiceAmountFiat / 100) * tipPercent;

	$: tipAmountFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(tipAmount);

	$: tipAmountSats = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		tipAmount / (setRate / 100000000)
	);

	$: totalAmountSats = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		$invoiceAmount + parseFloat(tipAmountSats.replace(/,/g, ''))
	);

	$: totalAmountFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format($invoiceAmountFiat + tipAmount);

	const invoiceAmountFormatted = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 0
	}).format($invoiceAmount);

	const invoiceAmountFiatFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format($invoiceAmountFiat);

	let customTipAmount;

	const tipAmounts = ['None', '10%', '15%', '20%'];

	const handleTipButtonClick = (amount) => {
		customTipAmount = '';
		if (amount === 'None') {
			tipPercent = 0;
		} else {
			tipPercent = amount.slice(0, 2);
		}
	};

	const handleCustomTipAmount = (e) => {
		tipPercent = 0;
		customTipAmount = e.target.value;
	};

	onMount(() => {
		const qrCode = new QRCodeStyling({
			width: window.screen.width < 640 ? 250 : 300,
			type: 'svg',
			data: text,
			image: '/images/invoice.svg',
			dotsOptions: {
				type: 'rounded'
			},
			imageOptions: {
				hideBackgroundDots: false
			}
		});

		qrCode.append(document.getElementById('qr'));
	});
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10" on:click={() => goto('/receive')}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="flex justify-center items-center mb-20 mt-[20px] px-3">
	<div
		class="block lg:flex justify-center items-center space-y-10 lg:space-y-0 space-x-0 lg:space-x-24"
	>
		{#if $invoiceAmount && $invoiceAmountFiat && $rate && text}
			<!-- tipping section  -->
			<div class="text-center space-y-5">
				<h1 class="text-4xl font-semibold">Add a tip?</h1>

				<div>
					<span class="font-semibold mr-1">{tipAmountFormatted}</span><span
						class="text-secondary font-semibold text-sm">{`(${tipAmountSats} SATS)`}</span
					>
					<span class="block text-secondary text-sm">{tipPercent}%</span>
				</div>

				<input
					id="slider"
					type="range"
					min="0"
					max="100"
					value={tipPercent}
					class="px-2"
					on:input={(e) => {
						customTipAmount = '';
						tipPercent = e.target.value;
					}}
				/>

				<div>
					{#each tipAmounts as amount}
						<button
							class="bg-primary w-20 py-3 m-1 rounded-2xl font-semibold {tipPercent ===
								amount.slice(0, 2) ||
							((tipPercent === 0 || tipPercent === '0') && amount === 'None')
								? '!bg-black text-white'
								: ''}"
							on:click={() => handleTipButtonClick(amount)}>{amount}</button
						>
					{/each}

					<div class="relative">
						<span
							class="absolute top-[20px] left-5 font-semibold {!customTipAmount
								? 'opacity-50'
								: 'opacity-100'}">$</span
						>
						<input
							type="number"
							min="0"
							on:input={(e) => handleCustomTipAmount(e)}
							class="bg-primary rounded-2xl py-3 px-10 font-semibold mt-2 mr-1 w-full md:w-auto"
							placeholder="Other"
						/>
						<button
							class="w-full md:w-auto mt-2 md:mt-0 bg-black text-white font-semibold py-3 px-7 rounded-2xl {!customTipAmount
								? 'opacity-50'
								: 'opacity-100'}"
							disabled={!customTipAmount}>Done</button
						>
					</div>
				</div>
			</div>

			<div
				class="h-[1px] lg:h-[600px] w-full lg:w-[1px] bg-lightgrey rounded-xl"
				id="section-divider"
			/>

			<!-- invoice section -->
			<div class="text-center space-y-5">
				<span class="text-secondary"
					>Scan to pay <span class="text-black font-semibold">insert name here</span></span
				>

				<div
					id="qr"
					class="border border-lightgrey rounded-3xl lg:p-5 flex justify-center items-center"
				/>

				<div class="px-5 space-y-3">
					<div class="flex justify-between">
						<span class="font-semibold text-sm">Invoice</span>
						<span class="font-semibold text-sm"
							>{invoiceAmountFiatFormatted}
							<span class="text-secondary font-normal">{`(${invoiceAmountFormatted} SATS)`}</span
							></span
						>
					</div>

					<div class="flex justify-between">
						<span class="font-semibold text-sm">Tip</span>
						<span class="font-semibold text-sm"
							>{tipAmountFormatted}
							<span class="text-secondary font-normal">{`(${tipAmountSats} SATS)`}</span></span
						>
					</div>

					<div class="flex justify-between">
						<span class="font-bold">Total</span>
						<span class="font-bold"
							>{totalAmountFormatted}
							<span class="text-secondary font-normal">{`(${totalAmountSats} SATS)`}</span></span
						>
					</div>
				</div>
			</div>
		{:else}
			<div
				class="w-[94vw] md:w-[375px] h-[381px] md:h-[269px] animate-pulse bg-gray-400 rounded-xl"
			/>
			<div
				class="h-[1px] lg:h-[600px] w-full lg:w-[1px] bg-lightgrey rounded-xl"
				id="section-divider"
			/>
			<div
				class="w-full md:w-[342px] h-[454px] md:h-[494px] animate-pulse bg-gray-400 rounded-xl"
			/>
		{/if}
	</div>
</div>

<style>
	#slider {
		-webkit-appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 5px;
		background: #eaecef;
		outline: none;
	}

	#slider:active {
		background-color: black;
	}

	#slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}

	#slider::-moz-range-thumb {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
