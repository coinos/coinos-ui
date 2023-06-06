<script>
	import { enhance } from '$app/forms';
	import { send } from '$lib/socket';
	import { post, back, copy, f, get, types, sat, reverseFormat, s, sats } from '$lib/utils';
	import { tick, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { last } from '$lib/store';
	import { Avatar, Icon, Heart, Image } from '$comp';
	import { t } from '$lib/translations';
	import { goto, invalidate } from '$app/navigation';

	export let data;

	let ndef;

	let reading = async ({ message, serialNumber }) => {
		let name = serialNumber.replace(/:/g, '-');
		let result = await post(`/pot/${name}/withdraw`, { amount, hash, name });
	};

	let readingerror = (e) => console.log('nfc error', e);

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
		request_id,
		user: { username, currency }
	} = invoice;

	$: showQr = invoice.uid === user?.id;

	$: src = sm;

	let qr;
	let tipPercent = 0;

	let refresh = async (data) => {
		({ invoice, id, user, sm, lg } = data);
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

		// if (browser && window.NDEFReader) {
		// 	try {
		// 		ndef = new NDEFReader();
		// 		await ndef.scan();
		//
		// 		ndef.removeEventListener('readingerror', readingerror);
		// 		ndef.removeEventListener('reading', reading);
		//
		// 		ndef.addEventListener('readingerror', readingerror);
		// 		ndef.addEventListener('reading', reading);
		// 	} catch (e) {
		// 		console.log(e);
		// 	}
		// }
	};

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
	$: tipAmount = ((tip * rate) / sats).toFixed(2);

	let subbed;

	onMount(async () => {
		if (browser) {
			last.subscribe((v) => {
				if (!v || subbed) return;
				subbed = true;
				send('subscribe', invoice);
			});
		}
	});

	onDestroy(() => {
		if (ndef) {
			ndef.removeEventListener('readingerror', readingerror);
			ndef.removeEventListener('reading', reading);
		}
	});

	$: link = type === 'bitcoin' ? text : `lightning:${text}`;
	$: txt = type === 'bitcoin' ? hash : text;

	let toggleType = async () => {
		invoice.type = invoice.type === types.lightning ? types.bitcoin : types.lightning;
		({ hash } = await post(`/${username}/invoice`, {
			invoice,
			user: { username, currency }
		}));

		goto(`./${hash}`, { invalidateAll: true });
	};
</script>

<div class="container mx-auto max-w-lg px-4 space-y-8">
	<div class="whitespace-nowrap my-auto ml-auto flex gap-2">
		<button
			class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full"
			class:bg-black={type === types.lightning}
			class:text-white={type === types.lightning}
			on:click={toggleType}
		>
			⚡️ Lightning
		</button>

		<button
			class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full flex justify-center "
			class:bg-black={type === types.bitcoin}
			class:text-white={type === types.bitcoin}
			on:click={toggleType}
		>
			<img
				src="/images/bitcoin.svg"
				class="my-auto w-8 border-4 border-transparent"
				alt="Bitcoin"
			/>
			<div class="my-auto">Bitcoin</div>
		</button>
	</div>

	{#if showQr}
		<div>
			<a href={invoice.type === 'bitcoin' ? invoice.text : 'lightning:' + invoice.text}>
				<div class="relative flex">
					<div class="flex mx-auto w-[360px] h-[360px]">
						<img
							{src}
							class="w-[300px] h-[300px] mx-auto z-10 mt-[20px]"
							bind:this={qr}
							alt={txt}
						/>
					</div>
					<div
						class="absolute m-auto left-0 right-0 w-[340px] h-[340px] rounded-full bg-gradient-to-r from-[#F2F6FC] to-[#E1E3FF] z-0"
					/>
				</div>
			</a>
		</div>
	{/if}

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

	<div class="text-center">
		<a href={link}>
			{txt.substr(0, 20)}...{txt.substr(-20)}
		</a>
	</div>

	<div class="w-full flex justify-center gap-2 flex-wrap">
		<button
			class="flex rounded-full justify-center border py-3 px-5 hover:opacity-80 w-full md:w-auto"
			on:click={() => copy(txt)}
		>
			<Icon icon="copy" style="mr-1" />
			<div class="text-secondary">{$t('payments.copyText')}</div></button
		>
			<a href={link} class="w-full md:w-auto">
		<button
			class="w-full md:w-auto flex justify-center rounded-full border py-3 px-5 hover:opacity-80"
		>
				<Icon icon="link" style="mr-1 w-6" />
				<div class="text-secondary">{$t('payments.openLink')}</div>
		</button>
			</a>

		<button
			class="w-full md:w-auto flex justify-center rounded-full border py-3 px-5 hover:opacity-80"
			on:click={() => (showQr = !showQr)}
		>
			<Icon icon="qr" style="mr-1 invert" />
			<div class="text-secondary">
				{showQr ? $t('payments.hide') : $t('payments.show')}
				{$t('payments.qr')}
			</div></button
		>
	</div>
</div>
