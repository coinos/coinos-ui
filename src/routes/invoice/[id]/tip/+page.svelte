<script>
	import { browser } from '$app/environment';
	import { invoices } from '$lib/store';
	import { copy, f, get, reverseFormat, s, sats } from '$lib/utils';
	import { Icon, Tip } from '$comp';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';

	const tipAmounts = ['No thank you', '10%', '15%', '20%'];
	let showCustomAmount;

	let customInput;
	let customTipAmount;

	let apply = async () => {
		if (customTipAmount > 0) {
			tipPercent = (customTipAmount / amountFiat) * 100;
			showCustomAmount = false;
		}
	};

	let active = (amount) =>
		!customTipAmount && Math.round(tipPercent) === parseInt(amount.slice(0, 2));

	const handleCustomTipAmount = (e) => {
		tipPercent = 0;
		customTipAmount = e.target.value;
	};

	let timeout;
	const handleSlide = (e) => {
		customTipAmount = '';
		if (customInput) {
			customInput.value = '';
		}
		tipPercent = e.target.value;

		clearTimeout(timeout);
		timeout = setTimeout(update, 800);
	};

	let submitting;
	const handleTipButtonClick = async (amount) => {
		submitting = true;
		if (amount === 'No thank you') {
			tipPercent = 0;
		} else {
			tipPercent = parseInt(amount.slice(0, 2));
		}

		await tick();
		submit.click();
	};

	let submit;
	let update = async () => {
		await tick();
		//submit.click();
	};

	export let data;
	$: refresh(data);
	let { invoice, id, user } = data;
	let {
		amount,
		rate,
		received,
		prompt,
		text,
		tip,
		user: { username, currency }
	} = invoice;

	let qr;
	let tipPercent = 0;

	let fullscreen;

	let refresh = (data) => {
		({ invoice, id } = data);
		({
			amount,
			rate,
			received,
			prompt,
			text,
			tip,
			user: { username, currency }
		} = invoice);

		tipPercent = (tip / amount) * 100;
	};

	$: tip = Math.round((amount / 100) * tipPercent);

	$invoices[id] = { amount, id, rate, received, text, tip, username };
	$: browser &&
		$invoices[id]?.received >= $invoices[id]?.amount &&
		goto(($invoices[id].memo === 'launch' && '/launch/purchase') || `/invoice/${id}/paid`);

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));

	$: tipAmount = ((tip * rate) / sats).toFixed(2);

	$: invoiceAmountFiatFormatted = f(amountFiat, currency);
</script>

<button
	class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80"
	class:invisible={!user}
	on:click={() => goto(`/${username}/receive`)}
>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 max-w-lg text-center mx-auto">
	<form method="POST" use:enhance class:invisible={submitting}>
		<input type="hidden" name="amount" value={amount} />
		<input type="hidden" name="tip" value={tip} />
		<input type="hidden" name="username" value={username} />
		<input type="hidden" name="rate" value={rate} />
		<input type="hidden" name="prompt" value="false" />

		<h1 class="text-4xl font-semibold my-8">{$t('invoice.addTipq')}</h1>
		{#if !showCustomAmount}
			<div class="my-2 text-xl">{Math.round(tipPercent)}%</div>

			<input
				id="slider"
				type="range"
				min="0"
				max="100"
				value={tipPercent}
				class="px-0 py-0 my-5"
				style="--bgPercent: {tipPercent}%;"
				on:input={handleSlide}
			/>

			<div class="flex mb-8">
				<div>
					<span class="text-sm font-semibold mr-1">
						{f(amountFiat, currency)}
						<span class="tect-secondary text-xl">+{f(tipAmount, currency)}</span></span
					>
				</div>

				<div class="ml-auto">
					<span class="text-secondary font-semibold text-sm">{s(amount)}</span>
					<span class="text-secondary font-semibold text-lg">+{s(tip)} SAT</span>
				</div>
			</div>

			{#if tip}
				<div>
					<button
						type="button"
						class="w-full text-2xl mt-2 bg-primary text-black hover:bg-black hover:text-white font-semibold py-3 px-7 rounded-2xl"
						on:click={() => submit.click()}>Next</button
					>
					<button
						type="button"
						class="w-full text-2xl mt-2 bg-primary text-black hover:bg-black hover:text-white font-semibold py-3 px-7 rounded-2xl"
						on:click={() => (tipPercent = 0)}>Reset</button
					>
				</div>
			{:else}
				{#each tipAmounts as amount}
					<button
						type="button"
						class:active={active(amount, tipPercent)}
						class="w-full text-2xl text-black bg-primary hover:bg-black hover:text-white py-3 m-1 rounded-2xl font-semibold"
						on:click={() => handleTipButtonClick(amount)}>{amount}</button
					>
				{/each}
			{/if}

			<div>
				<button
					type="button"
					class="w-full text-2xl mt-2 bg-primary text-black hover:bg-black hover:text-white font-semibold py-3 px-7 rounded-2xl"
					on:click={() => (showCustomAmount = true)}>Custom</button
				>
			</div>
		{/if}

		<button type="submit" bind:this={submit} />
	</form>

	{#if showCustomAmount}
		<form on:submit|preventDefault={apply}>
			<div class="relative">
				<span
					class="absolute top-[18px] left-5 font-semibold {!customTipAmount
						? 'opacity-50'
						: 'opacity-100'}">$</span
				>
				<input
					bind:this={customInput}
					type="number"
					step="0.01"
					on:input={(e) => handleCustomTipAmount(e)}
					class="pl-10"
					placeholder="Custom amount"
					autofocus
				/>
				<button
					type="submit"
					class="w-full mt-2 bg-black text-white font-semibold py-3 px-7 rounded-2xl {!customTipAmount
						? 'opacity-50'
						: 'opacity-100 hover:opacity-80'}"
					disabled={!customTipAmount}>Apply</button
				>
			</div>
		</form>
	{/if}
</div>

<style>
	#slider {
		-webkit-appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 5px;
		background: linear-gradient(
			to right,
			black 0%,
			black var(--bgPercent),
			#f5f7fa var(--bgPercent),
			#f5f7fa 100%
		);
		outline: none;
	}

	#slider:active {
		background-color: black;
	}

	#slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}

	#slider::-moz-range-thumb {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: black;
		cursor: pointer;
	}

	.active {
		@apply !bg-black !text-white;
	}
</style>
