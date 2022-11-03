<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Icon, PageNotFound } from '$comp';
	import { copy } from '$lib/utils';
	import { t } from '$lib/translations';
	export let data;

	let { subject } = data;

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

<div class="container px-4 flex flex-wrap">
	<div class="p-10 pt-20">
		<h1 class="text-3xl font-bold">{subject.username}</h1>

		<p class="text-secondary w-64 mb-4">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</p>

		<div class="flex gap-2">
			<button
				class="border rounded-full py-2 w-28 font-semibold flex justify-center items-center text-sm"
				on:click={() => (followed = !followed)}
				><Icon icon={followed ? 'minus' : 'plus'} style="mr-1" />
				{$t('user.' + (followed ? 'following' : 'follow'))}
			</button>

			<a href={`/${subject.username}/receive`}>
				<button
					class="border rounded-full py-2 w-28 font-semibold flex justify-center items-center text-sm"
				>
					<Icon icon="send" style="mr-1" />
					Pay
				</button>
			</a>
		</div>
	</div>

	<div class="space-y-5 md:mt-20 mx-auto w-[350px]">
		<div
			on:click={() => copy(lightningAddress)}
			id="qr"
			class="cursor-pointer w-[292px] md:w-[342px] h-[342px] border border-lightgrey rounded-3xl flex p-5 justify-center items-center relative mx-auto"
		/>

		<div class="bg-primary font-semibold rounded-xl text-sm p-3 flex justify-between items-center">
			<span class="mx-auto">{lightningAddress}</span>
			<button class="hover:opacity-80" on:click={() => copy(lightningAddress)}>
				<Icon icon="copy" style="ml-2" />
			</button>
		</div>
		<p class="text-center">
			This is a <a href="https://lightningaddress.com/" class="underline" target="_blank" rel="noreferrer"
				>lightning address</a
			>
		</p>
	</div>
</div>
