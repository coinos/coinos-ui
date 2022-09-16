<script>
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { copy, f, get, post, reverseFormat, s } from '$lib/utils';
	import { browser } from '$app/environment';
	import { invoices, user } from '$lib/store';
	import { Icon, Image, Qr } from '$comp';
	import { goto, invalidate } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { t } from '$lib/translations';

	export let data;
	$: refresh(data);
	let { invoice, id } = data;
	let {
		amount,
		rate,
		status,
		text,
		tip,
		user: { username, currency }
	} = invoice;

	let image = '/images/invoice.svg';
	let qr;
	let tipPercent = 0;

	let refresh = (data) => {
		({ invoice, id } = data);
		({
			amount,
			rate,
			status,
			text,
			tip,
			user: { username, currency }
		} = invoice);

		amount -= tip;

		tipPercent = (tip / amount) * 100;
	};

	$: tip = Math.round((amount / 100) * tipPercent);

	$invoices[id] = { amount, id, rate, status, text, tip, username };

	$: amountFiat = parseFloat(((amount * rate) / 100000000).toFixed(2));

	$: tipAmount = ((tip * rate) / 100000000).toFixed(2);

	$: tipAmountFormatted = f(tipAmount, currency);

	$: tipAmountSats = s(tip);

	$: totalAmountSats = s(amount + parseFloat(tipAmountSats.replace(/,/g, '')));

	let apply = async () => {
		tipPercent = (customTipAmount / amountFiat) * 100;
		update();
		showMobileTip = false;
	};

	let update = async () => {
		await tick();
		let r = await post(`/invoice`, {
			amount: parseInt(amount + tip),
			rate,
			tip,
			text,
			username
		});

		goto(`/invoice/${r}`);
	};

	$: totalAmountFormatted = f(amountFiat + parseFloat(tipAmount), currency);

	const amountFormatted = s(amount);

	$: invoiceAmountFiatFormatted = f(amountFiat, currency);

	let customTipAmount;

	const tipAmounts = ['None', '10%', '15%', '20%'];

	let timeout;
	const handleSlide = (e) => {
		customTipAmount = '';
		customInput.value = '';
		tipPercent = e.target.value;
		clearTimeout(timeout);
		timeout = setTimeout(update, 100);
	};

	const handleTipButtonClick = (amount) => {
		customTipAmount = '';
		customInput.value = '';

		if (amount === 'None') {
			tipPercent = 0;
		} else {
			tipPercent = parseInt(amount.slice(0, 2));
		}

		update();
	};

	const handleCustomTipAmount = (e) => {
		tipPercent = 0;
		customTipAmount = e.target.value;
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
			goto(`/${username}/receive`);
		}
	};

	let customInput;

	const handleDoneClick = () => {
		goto(`/${username}/receive`);
	};

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			qr.requestFullscreen().catch((err) => {
				alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
			});
		} else {
			document.exitFullscreen();
		}
	}
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
						: '-top-full'} bg-white p-6 md:p-0 rounded-t-3xl md:rounded-none left-0 md:static text-center space-y-5"
				>
					<h1 class="hidden md:block text-4xl font-semibold">{$t('invoice.addTipq')}</h1>

					<div>
						<span class="font-semibold mr-1">{tipAmountFormatted}</span><span
							class="text-secondary font-semibold text-sm">{`(${tipAmountSats} SAT)`}</span
						>
						<span class="block text-secondary text-sm">{Math.round(tipPercent)}%</span>
					</div>

					<input
						id="slider"
						type="range"
						min="0"
						max="100"
						value={tipPercent}
						class="px-2 py-0"
						on:input={handleSlide}
					/>

					<div>
						{#each tipAmounts as amount}
							<button
								class="bg-primary w-16 md:w-20 py-3 m-1 rounded-2xl font-semibold {customTipAmount
									? ''
									: Math.round(tipPercent) === parseInt(amount.slice(0, 2)) ||
									  (!tipPercent && amount === 'None')
									? '!bg-black text-white'
									: ''}"
								on:click={() => handleTipButtonClick(amount)}>{amount}</button
							>
						{/each}

						<div class="relative">
							<span
								class="absolute top-[18px] left-5 font-semibold {!customTipAmount
									? 'opacity-50'
									: 'opacity-100'}">$</span
							>
							<input
								bind:this={customInput}
								type="number"
								min="0"
								on:input={(e) => handleCustomTipAmount(e)}
								class="pl-10"
								placeholder="Other"
							/>
							<button
								class="w-full md:w-auto mt-2 bg-black text-white font-semibold py-3 px-7 rounded-2xl {showMobileTip
									? !customTipAmount && !tipAmount
										? 'opacity-50'
										: 'opacity-100'
									: !customTipAmount
									? 'opacity-50'
									: 'opacity-100'}"
								disabled={showMobileTip ? !customTipAmount && !tipAmount : !customTipAmount}
								on:click={apply}>Apply</button
							>
							<!-- found missing translation --->
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
						</svg>
						{$t('invoice.addTip')}
					</button>

					<!-- found missing translation --->
					<span class="text-secondary block"
						>Scan to pay <a href="/{username}" class="text-black font-semibold">{username}</a></span
					>

					<div class="border border-gray-200 rounded-2xl">
						<Qr {text} {image} bind:qr />
					</div>

					<div>
						<button
							class="border border-lightgrey rounded-md p-2 mx-2 hover:bg-primary"
							on:click={toggleFullscreen}><Icon icon="expand" /></button
						>
						<button
							class="border border-lightgrey rounded-md p-2 mx-2 hover:bg-primary"
							on:click={() => copy(text)}><Icon icon="copy" /></button
						>
					</div>

					<div class="px-5 space-y-3">
						<div class="flex justify-between">
							<!-- found missing translation --->
							<span class="font-semibold text-sm">Invoice</span>
							<span class="font-semibold text-sm"
								>{invoiceAmountFiatFormatted}
								<span class="text-secondary font-normal">{`(${amountFormatted} SAT)`}</span></span
							>
						</div>

						<div class="flex justify-between">
							<!-- found missing translation --->
							<span class="font-semibold text-sm">Tip</span>
							<span class="font-semibold text-sm"
								>{tipAmountFormatted}
								<span class="text-secondary font-normal">{`(${tipAmountSats} SAT)`}</span></span
							>
						</div>

						<div class="flex flex-wrap justify-between">
							<!-- found missing translation --->
							<span class="font-bold mr-1">Total</span>
							<span class="font-bold"
								>{totalAmountFormatted}
								<span class="text-secondary font-normal">{`(${totalAmountSats} SAT)`}</span></span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="text-center mt-20 md:mt-0">
		{#if typeof window !== 'undefined'}
			<div class="w-full mx-auto max-w-xl">
				<LottiePlayer
					src="/lottie/success.json"
					autoplay={true}
					loop={true}
					controls={false}
					renderer="svg"
					background="transparent"
				/>
			</div>
		{/if}
		<h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('invoice.paymentSuccessful')}</h1>
		<h2 class="text-2xl md:text-3xl font-semibold">
			{totalAmountFormatted}
		</h2>
		<h3 class="text-secondary md:text-lg mb-6 mt-1">({totalAmountSats} SAT)</h3>
		<button class="bg-black text-white rounded-2xl w-20 py-3 font-bold" on:click={handleDoneClick}>
			{$t('invoice.done')}
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
