<script>
	throw new Error("@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)");

	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { AppHeader, Icon, PageNotFound } from '$comp';
	import { user } from '$lib/store';
	import { copy } from '$lib/utils';
	export let username;

	let lightningAddress = `${username}@coinos.io`;

	onMount(async () => {
		if (browser) {
			let { default: QRCodeStyling } = await import('qr-code-styling');
			const qrCode = new QRCodeStyling({
				width: window.screen.width < 640 ? 250 : 300,
				type: 'canvas',
				data: 'add static qr here',
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

{#if username}
	<AppHeader avatarPosition="left-[calc(15vw-48px)]" />

	<div class="flex xl:block justify-center items-center my-20 px-3">
		<div class="space-y-10 xl:space-y-0">
			<div class="xl:ml-[calc(15vw-48px)] space-y-2 w-full md:w-72">
				<h1 class="text-3xl font-bold">{username}</h1>

				<p class="text-secondary">Address goes here</p>

				<!--
        we need to hook this up
        <button
					class="border rounded-full py-2 w-28 font-semibold flex justify-center items-center text-sm"
					on:click={() => (followed = !followed)}
					><Icon icon={followed ? 'minus' : 'plus'} style="mr-1" />
					{followed ? 'Remove' : 'Follow'}
				</button>
        -->
			</div>

			<div class="space-y-5 static xl:absolute top-[255px] left-[calc(50vw-150px)]">
				<div
					id="qr"
					class="w-[292px] md:w-[342px] h-[342px] border border-lightgrey rounded-3xl flex p-5 justify-center items-center relative"
				/>

				<p class="text-secondary text-center font-semibold">Scan to pay with bitcoin</p>

				<div
					class="bg-primary font-semibold rounded-xl text-sm py-2 px-3 flex flex-wrap justify-center items-center"
				>
					<span>{lightningAddress}</span>
					<button on:click={() => copy(lightningAddress)}>
						<Icon icon="copy" style="ml-2" />
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<PageNotFound />
{/if}
