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
	<div class="w-full sm:w-[340px] pt-20 space-y-5 mr-4">
		<h1 class="text-3xl font-bold text-center sm:text-left">{subject.username}</h1>

		<div class="text-secondary w-64">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		{#if user?.username !== subject.username}
			<div>
				<a href={`/${subject.username}/receive`}>
					<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2">
						Pay
					</button>
				</a>

				<a href={`/${subject.username}/request`}>
					<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
						>Request an invoice</button
					>
				</a>
			</div>
		{/if}
	</div>

	<div class="space-y-5 mt-5 sm:mt-20 mx-auto max-w-lg">
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
			<div class="my-auto font-semibold text-lg w-full text-center">{lightningAddress}</div>
			<button class="ml-auto hover:opacity-80" on:click={() => copy(lightningAddress)}>
				<Icon icon="copy" on:click={() => copy(lightningAddress)} />
			</button>
		</div>
	</div>
</div>
