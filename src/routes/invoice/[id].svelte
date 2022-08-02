<script>
	import { toast } from '@zerodevx/svelte-toast';
	import { get, post, reverseFormat } from '$lib/utils';
	import { browser } from '$app/env';
	import { invoices, user, preferredCurrency } from '$lib/store';
	import { Icon, Image } from '$comp';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { copy } from '$lib/utils';

	export let amount, id, rate, status, text, username;

	$invoices[id] = { amount, id, rate, status, text, username };

	$: amountFiat = parseFloat(((amount * rate) / 100000000).toFixed(2));

	let tipPercent = 0;
	let qr;

	$: tipAmount = customTipAmount
		? customTipAmount < 0
			? (customTipAmount = 0)
			: customTipAmount
		: (amountFiat / 100) * tipPercent;

	$: tipAmountFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(tipAmount);

	$: tipAmountSats = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		tipAmount / (rate / 100000000)
	);

	$: totalAmountSats = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
		amount + parseFloat(tipAmountSats.replace(/,/g, ''))
	);

	$: update(tipAmountSats);
	let update = async (n) => {
		let { id } = await post('/invoice', {
			amount: amount + reverseFormat(n),
			rate,
			text,
			username
		});
		({ text } = await get(`/invoice/${id}`));
	};

	$: totalAmountFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amountFiat + parseFloat(tipAmount));

	const amountFormatted = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 0
	}).format(amount);

	$: invoiceAmountFiatFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amountFiat);

	let customTipAmount;

	const tipAmounts = ['None', '10%', '15%', '20%'];

	const handleTipButtonClick = (amount) => {
		customTipAmount = '';
		customInput.value = '';

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

	$: generate(text);
	let generate = async (ready) => {
		console.log('GENERATE', text);
		if (!ready) return;
		let { default: QRCodeStyling } = await import('qr-code-styling');

		const qrCode = new QRCodeStyling({
			width: window.screen.width < 640 ? 250 : 300,
			type: 'canvas',
			data: text,
			image: '/images/invoice.svg',
			backgroundOptions: {
				color: 'rgba(0, 0, 0, 0)'
			},
			dotsOptions: {
				type: 'rounded'
			},
			imageOptions: {
				hideBackgroundDots: false
			}
		});

		qrCode.append(qr);
	};

	let showMobileTip = false;

	const handleBackButton = () => {
		if (showMobileTip) {
			tipPercent = 0;
			customInput.value = '';
			customTipAmount = 0;
			tipAmount = 0;
			showMobileTip = false;
		} else {
			goto(`/${$user.username}/receive`);
		}
	};

	let customInput;

	const handleCopy = () => {
		copy(text);
		toast.push('Copied!', {
			theme: {
				'--toastBarBackground': '#2F855A'
			}
		});
	};

	const handleDoneClick = () => {
		if ($user) {
			goto(`/${$user.username}/receive`);
		} else {
			goto('/');
		}
	};
</script>

{#if $invoices[id]?.status !== 'paid'}
	<div class:full-shadow={showMobileTip}>
		<button
			class="ml-5 md:ml-20 mt-5 md:mt-10"
			class:invisible={!$user}
			on:click={handleBackButton}
		>
			<Icon icon="arrow-left" style="w-10" />
		</button>

		<div class="flex justify-center items-center mb-20 md:mt-[20px] px-3">
			<div
				class="block lg:flex justify-center items-center space-y-10 lg:space-y-0 space-x-0 lg:space-x-24"
			>
				<!-- tipping section  -->
				<div
					class="w-[100%] md:w-auto absolute {showMobileTip
						? 'bottom-0'
						: '-bottom-full'} bg-white p-6 md:p-0 rounded-t-3xl md:rounded-none transition-all md:transition-none ease-in-out duration-500 left-0 md:static text-center space-y-5"
				>
					<h1 class="hidden md:block text-4xl font-semibold">Add a tip?</h1>

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
							customInput.value = '';
							tipPercent = e.target.value;
						}}
					/>

					<div>
						{#each tipAmounts as amount}
							<button
								class="bg-primary w-16 md:w-20 py-3 m-1 rounded-2xl font-semibold {customTipAmount
									? ''
									: tipPercent === amount.slice(0, 2) ||
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
								bind:this={customInput}
								type="number"
								min="0"
								on:input={(e) => handleCustomTipAmount(e)}
								class="bg-primary rounded-2xl py-3 px-10 font-semibold mt-2 mr-1 w-full md:w-auto"
								placeholder="Other"
							/>
							<button
								class="w-full md:w-auto mt-2 md:mt-0 bg-black text-white font-semibold py-3 px-7 rounded-2xl {showMobileTip
									? !customTipAmount && !tipAmount
										? 'opacity-50'
										: 'opacity-100'
									: !customTipAmount
									? 'opacity-50'
									: 'opacity-100'}"
								disabled={showMobileTip ? !customTipAmount && !tipAmount : !customTipAmount}
								on:click={() => (showMobileTip = false)}>Done</button
							>
						</div>
					</div>
				</div>

				<div
					class="hidden md:block h-[1px] lg:h-[600px] w-full lg:w-[1px] bg-lightgrey rounded-xl"
					id="section-divider"
				/>

				<!-- invoice section -->
				<div class="text-center space-y-5">
					<button
						class="block md:hidden bg-black {showMobileTip
							? 'text-white/50'
							: 'text-white'} rounded-xl px-6 py-3 block text-sm font-semibold mx-auto flex justify-center items-center"
						on:click={() => (showMobileTip = true)}
						disabled={showMobileTip}
					>
						<svg
							width="24"
							height="24"
							class="mr-1"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12.0001 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12.0001 7.63609L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg> Add a tip
					</button>

					<span class="text-secondary block"
						>Scan to pay <span class="text-black font-semibold">{username}</span></span
					>

					<div
						bind:this={qr}
						on:click={handleCopy}
						class="border {showMobileTip
							? 'border-gray-400'
							: 'border-lightgrey'} rounded-3xl block md:flex justify-center items-center cursor-pointer"
					/>

					<div class="px-5 space-y-3">
						<div class="flex justify-between">
							<span class="font-semibold text-sm">Invoice</span>
							<span class="font-semibold text-sm"
								>{invoiceAmountFiatFormatted}
								<span class="text-secondary font-normal">{`(${amountFormatted} SATS)`}</span></span
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
			</div>
		</div>
	</div>
{:else}
	<div class="text-center mt-20 md:mt-0">
		<Image image="success" style="w-full md:w-3/4 xl:w-1/2 mx-auto max-w-3xl" />
		<h1 class="text-3xl md:text-4xl font-bold mb-6">Payment Successful!</h1>
		<h2 class="text-2xl md:text-3xl font-semibold">{totalAmountFormatted} {$preferredCurrency}</h2>
		<h3 class="text-secondary md:text-lg mb-6 mt-1">({totalAmountSats} SATS)</h3>
		<button class="bg-black text-white rounded-2xl w-20 py-3 font-bold" on:click={handleDoneClick}>
			Done
		</button>
	</div>
{/if}

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

	.full-shadow {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
	}
</style>
