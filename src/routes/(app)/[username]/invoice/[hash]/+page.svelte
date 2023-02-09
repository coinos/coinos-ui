<script>
	import { send } from '$lib/socket';
	import { back, copy, f, get, sat, reverseFormat, s, sats } from '$lib/utils';
	import { tick, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { last } from '$lib/store';
	import { Avatar, Icon, Heart, Image } from '$comp';
	import { t } from '$lib/translations';
	import screenfull from 'screenfull';

	export let data;

	$: refresh(data);
	let { invoice, id, user, sm, lg } = data;
	let {
		amount,
		hash,
		type,
		rate,
		received,
		prompt,
		text,
		tip,
		user: { username, currency }
	} = invoice;

	let showQr = !amount;

	let src = sm;

	let qr;
	let tipPercent = 0;

	let refresh = (data) => {
		({ invoice, id } = data);
		({
			amount,
			hash,
			type,
			rate,
			received,
			prompt,
			text,
			tip,
			user: { username, currency }
		} = invoice);

		tipPercent = (tip / amount) * 100;
	};

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
	$: tipAmount = ((tip * rate) / sats).toFixed(2);

	let subbed;
	onMount(() => {
		browser &&
			last.subscribe((v) => {
				if (!v || subbed) return;
				subbed = true;
				send('subscribe', invoice);
			});
	});

	$: link = type === 'bitcoin' ? text : `lightning:${text}`;
	$: txt = type === 'bitcoin' ? hash : text;

	let full;
	let toggle = () => {
		screenfull.toggle(qr);
		full = !full;
		if (full) src = lg;
		else src = sm;
	};
</script>

<div class="container mx-auto max-w-lg px-4 space-y-5">
	<div class="relative flex">
		<div class="flex mx-auto w-[360px] h-[360px]">
			<img
				{src}
				class:p-4={full}
				class="w-[300px] h-[300px] mx-auto z-10 mt-[20px]"
				bind:this={qr}
				on:click={toggle}
				on:keydown={toggle}
				alt={txt}
			/>
		</div>
		<div
			class="absolute m-auto left-0 right-0 w-[340px] h-[340px] rounded-full bg-gradient-to-r from-[#F2F6FC] to-[#E1E3FF] z-0"
		/>
	</div>

	{#if amount > 0}
		<div class="text-center font-bold text-2xl">
			<div>
				{f(amountFiat, currency)}

				{#if tip}
					<span class="text-sm">
						+{f(tip * (rate / sats), currency)}
					</span>
				{/if}
			</div>
			<div>
				<span class="text-secondary font-normal text-lg">{`${sat(amount)}`}</span>

				{#if tip}
					<span class="text-sm text-secondary font-normal">
						+{sat(tip)}
					</span>
				{/if}
			</div>
		</div>
	{/if}

	<div class="w-full flex justify-center">
		<button class="flex rounded-full border py-2 px-5 hover:opacity-80" on:click={() => copy(txt)}>
			<Icon icon="copy" style="mr-1" />
			<div class="text-secondary">{txt.substr(0, 10)}..{txt.substr(-6)}</div></button
		>
	</div>
</div>
