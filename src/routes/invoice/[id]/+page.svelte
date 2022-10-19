<script>
	import { copy, f, get, reverseFormat, s, sats } from '$lib/utils';
	import { browser } from '$app/environment';
	import { invoices } from '$lib/store';
	import { Icon, Heart, Image, Qr, Tip } from '$comp';
	import { goto } from '$app/navigation';
	import { t } from '$lib/translations';

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

	let showMobileTip = false;

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

{$invoices[id]?.memo}
<div class:full-shadow={showMobileTip}>
	<button
		class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80"
		class:invisible={!user}
		disabled={showMobileTip}
		on:click={() => goto(`/${username}/receive`)}
	>
		<Icon icon="arrow-left" style="w-10" />
	</button>

	<div class="flex justify-center items-center mb-20 md:mt-[20px] px-3">
		<div
			class="block lg:flex justify-center items-center space-y-10 lg:space-y-0 space-x-0 lg:space-x-24"
		>
			{#if invoice.prompt}
				<Tip
					bind:amountFiat
					bind:showMobileTip
					bind:tipPercent
					bind:tipAmount
					bind:amount
					bind:tip
					bind:currency
					bind:username
				/>
			{/if}

			<!-- invoice section -->
			<div class="text-center space-y-5">
				<button
					class="block md:hidden bg-black {showMobileTip
						? 'text-white/50'
						: 'text-white'} rounded-xl px-6 py-3 block text-sm font-semibold mx-auto flex justify-center items-center"
					on:click={() => (showMobileTip = true)}
					disabled={showMobileTip}
				>
					<Heart />
					{$t('invoice.addTip')}
				</button>

				<!-- found missing translation --->
				<span class="text-secondary block text-2xl break-all"
					>Scan to pay <a href="/{username}" class="text-black font-semibold hover:opacity-80"
						>{username}</a
					></span
				>

				<Qr {text} image={'/images/invoice.svg'} disabled={showMobileTip} bind:qr />

				<div>
					<button
						class="flex rounded-full border py-2 px-5 font-bold hover:opacity-80 mb-2 mx-auto"
						on:click={() => copy(text)}
						><Icon icon="copy" style="mr-1" />
						<div>Copy</div></button
					>
				</div>

				<div class="px-5 space-y-3">
					<div class="flex justify-between">
						<span class="font-semibold text-sm">{$t('invoice.invoice')}</span>
						<span class="font-semibold text-sm"
							>{invoiceAmountFiatFormatted}
							<span class="text-secondary font-normal">{`(${s(amount)} SAT)`}</span></span
						>
					</div>

					<div class="flex justify-between">
						<span class="font-semibold text-sm">{$t('invoice.tip')}</span>
						<span class="font-semibold text-sm"
							>{f(tipAmount, currency)}
							<span class="text-secondary font-normal">{`(${s(tip)} SAT)`}</span></span
						>
					</div>

					<div class="flex flex-wrap justify-between">
						<span class="font-bold mr-1">{$t('invoice.total')}</span>
						<span class="font-bold"
							>{f(amountFiat + parseFloat(tipAmount), currency)}
							<span class="text-secondary font-normal">{`(${s(tip + amount)} SAT)`}</span></span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.full-shadow {
		box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
	}
</style>
