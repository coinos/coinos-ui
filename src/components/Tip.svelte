<script>
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { f, post, s } from '$lib/utils';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';

	export let amountFiat,
		showCustomAmount,
		showMobileTip,
		tipPercent,
		tipAmount,
		amount,
		currency,
		tip,
		prompt,
		rate,
		text,
		username;

	const tipAmounts = ['None', '10%', '15%', '20%'];

	let customInput;
	let customTipAmount;

	let apply = async () => {
		if (customTipAmount > 0) {
			tipPercent = (customTipAmount / amountFiat) * 100;
			console.log('TIP PERCENT', tipPercent);
			update();
			showMobileTip = false;
			showCustomAmount = false;
		}
	};

	let update = async () => {
		await tick();
		let { uuid } = await post(`/invoice`, {
			amount: parseInt(amount + tip),
			prompt,
			rate,
			tip,
			text,
			user: { username }
		});

		goto(`/invoice/${uuid}`);
	};

	const handleCustomTipAmount = (e) => {
		tipPercent = 0;
		customTipAmount = e.target.value;
	};

	const handleMobileClose = () => {
		tipPercent = 0;
		if (customInput) {
			customInput.value = '';
		}
		customTipAmount = 0;
		tipAmount = 0;
		showMobileTip = false;
		showCustomAmount = false;
	};

let timeout;
	const handleSlide = (e) => {
		customTipAmount = '';
		if (customInput) {
			customInput.value = '';
		}
		tipPercent = e.target.value;

		clearTimeout(timeout);
		timeout = setTimeout(update, 100);
	};

	const handleTipButtonClick = (amount) => {
		customTipAmount = '';
		if (customInput) {
			customInput.value = '';
		}

		if (amount === 'None') {
			tipPercent = 0;
		} else {
			tipPercent = parseInt(amount.slice(0, 2));
		}
		showMobileTip = false;
		update();
	};
</script>

<div
	class="w-[100%] md:w-auto absolute {showMobileTip
		? 'bottom-0'
		: '-top-full'} bg-white p-6 md:p-0 rounded-t-3xl md:rounded-none left-0 md:static text-center space-y-5"
>
	<div class="flex justify-end items-center">
		<button class="block md:hidden bg-primary rounded-full p-2" on:click={handleMobileClose}
			><Icon icon="close" /></button
		>
		<button
			class="hidden {showCustomAmount ? 'md:block' : ''}"
			on:click={() => (showCustomAmount = false)}
			><Icon icon="close" style="hover:opacity-80" /></button
		>
	</div>
	<h1 class="hidden md:block text-4xl font-semibold">{$t('invoice.addTipq')}</h1>
	{#if !showCustomAmount}
		<div>
			<span class="font-semibold mr-1">{f(tipAmount, currency)}</span><span
				class="text-secondary font-semibold text-sm">{`(${s(tip)} SAT)`}</span
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
			on:change={() => (showMobileTip = false)}
		/>
	{/if}
	<div>
		{#if !showCustomAmount}
			{#each tipAmounts as amount}
				<button
					class="bg-black text-white md:text-black md:bg-primary md:hover:bg-black md:hover:text-white w-16 md:w-20 py-3 m-1 rounded-2xl font-semibold {customTipAmount
						? ''
						: Math.round(tipPercent) === parseInt(amount.slice(0, 2)) ||
						  (!tipPercent && amount === 'None')
						? '!bg-black !text-white'
						: ''}"
					on:click={() => handleTipButtonClick(amount)}>{amount}</button
				>
			{/each}
		{/if}
		{#if showCustomAmount}
			<div class="relative">
				<span
					class="absolute top-[18px] left-5 font-semibold {!customTipAmount
						? 'opacity-50'
						: 'opacity-100'}">$</span
				>
				<input
					bind:this={customInput}
					type="number"
					on:input={(e) => handleCustomTipAmount(e)}
					class="pl-10"
					placeholder="Other"
				/>
				<button
					class="w-full mt-2 bg-black text-white font-semibold py-3 px-7 rounded-2xl {!customTipAmount
						? 'opacity-50'
						: 'opacity-100 hover:opacity-80'}"
					disabled={!customTipAmount}
					on:click={apply}>Apply</button
				>
				<!-- found missing translation --->
			</div>
		{:else}
			<div>
				<button
					class="w-full md:w-auto mt-2 bg-black md:bg-primary text-white md:text-black md:hover:bg-black md:hover:text-white font-semibold py-3 px-7 rounded-2xl"
					on:click={() => (showCustomAmount = true)}>Custom amount</button
				>
			</div>
		{/if}
	</div>
</div>

<div
	class="hidden md:block h-[1px] lg:h-[600px] w-full lg:w-[1px] bg-lightgrey rounded-xl"
	id="section-divider"
/>

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
</style>
