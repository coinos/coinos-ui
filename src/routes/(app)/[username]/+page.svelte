<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Icon, PageNotFound } from '$comp';
	import { copy } from '$lib/utils';
	import { t } from '$lib/translations';
	export let data;

	let { user, subject } = data;

	let lightningAddress = `${data?.username}@coinos.io`;

	onMount(async () => {
		if (browser) {
			let { default: QRCodeStyling } = await import('qr-code-styling');
			const qrCode = new QRCodeStyling({
				width: window.screen.width < 640 ? 250 : 300,
				type: 'canvas',
				data: lightningAddress,
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

			qrCode.append(document.getElementById('qr'));
		}
	});

	let followed = false;
</script>

<div class="container px-4 flex flex-wrap sm:flex-nowrap mb-4">
	<div class="hidden sm:block w-sm min-w-sm pt-20 space-y-5">
		<h1 class="text-3xl font-bold">{subject.username}</h1>

		<p class="text-secondary w-64 mb-4">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</p>

		{#if user?.username !== subject.username}
			<a href={`/${subject.username}/receive`}>
				<button
					class="w-full sm:w-40 mt-2 text-black hover:bg-black hover:text-white font-semibold py-3 px-5 rounded-full border border-black"
				>
					Pay
				</button>
			</a>

			<a href={`/${subject.username}/request`}>
				<button class="w-full sm:w-40 mt-2 bg-black text-white font-semibold py-3 px-5 rounded-full"
					>Request invoice</button
				>
			</a>
		{/if}
	</div>

	<div class="space-y-5 mt-20 mx-auto max-w-lg">
		<h1 class="text-2xl font-bold sm:hidden text-center">{subject.username}</h1>
		<span class="font-bold mb-1">Lightning address</span>
		<p class="text-secondary mb-1">
			This <a href="https://lightningaddress.com" class="underline" target="_blank" rel="noreferrer"
				>lightning address</a
			> can be used repeatedly so you can publish it on websites, business cards, posters, etc.
		</p>

		<div
			on:click={() => copy(lightningAddress)}
			id="qr"
			class="cursor-pointer w-[292px] md:w-[342px] h-[342px] border border-lightgrey rounded-3xl flex p-5 justify-center items-center relative mx-auto"
		/>

		<div class="bg-primary font-semibold rounded-xl text-sm p-3 flex">
			<div class="my-auto">{lightningAddress}</div>
			<button class="ml-auto hover:opacity-80" on:click={() => copy(lightningAddress)}>
				<Icon icon="copy" style="ml-2" />
			</button>
		</div>
	</div>
</div>
