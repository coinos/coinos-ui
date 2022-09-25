<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { AppHeader, Icon, PageNotFound } from '$comp';
	import { subject, user } from '$lib/store';
	import { copy } from '$lib/utils';
	import { t } from '$lib/translations';
	export let data;

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

<AppHeader avatarPosition="left-[calc(15vw-64px)]" />

<div class="flex xl:block justify-center items-center my-20 px-3">
	<div class="space-y-10 xl:space-y-0">
		<div class="xl:ml-[calc(15vw-64px)] space-y-2 w-full md:w-72">
			<h1 class="text-3xl font-bold">{$subject.username}</h1>

			<p class="text-secondary">
				{$subject.address && $subject.address !== 'null' ? $subject.address : ''}
			</p>

			<!-- TODO
        we need to hook this up
        <button
					class="border rounded-full py-2 w-28 font-semibold flex justify-center items-center text-sm"
					on:click={() => (followed = !followed)}
					><Icon icon={followed ? 'minus' : 'plus'} style="mr-1" />
					{$t('user.' + (followed ? 'remove' : 'follow'))}
				</button>
        -->
		</div>

		<div class="space-y-5 static xl:absolute top-[255px] left-[calc(50vw-150px)]">
			<div
				on:click={() => copy(lightningAddress)}
				id="qr"
				class="cursor-pointer w-[292px] md:w-[342px] h-[342px] border border-lightgrey rounded-3xl flex p-5 justify-center items-center relative"
			/>

			<p class="text-secondary text-xl text-center font-semibold">{$t('user.scanToPayBTC')}</p>

			<div
				class="bg-primary font-semibold rounded-xl text-sm p-3 flex flex-wrap justify-between items-center"
			>
				<span>{lightningAddress}</span>
				<button class="hover:opacity-80" on:click={() => copy(lightningAddress)}>
					<Icon icon="copy" style="ml-2" />
				</button>
			</div>
		</div>
	</div>
</div>
