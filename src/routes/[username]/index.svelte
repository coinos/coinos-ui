<script>
	import { toast } from '@zerodevx/svelte-toast';
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
				type: 'svg',
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

	let qrSkeleton = true;
	setTimeout(() => (qrSkeleton = false), 100);

	const handleCopy = () => {
		copy(lightningAddress);
		toast.push('Copied!', {
			theme: {
				'--toastBarBackground': '#2F855A'
			}
		});
	};
</script>

<!-- need to update this IF statement to only show if the username matches a user in the DB -->
{#if username}
	<AppHeader avatarPosition="left-[calc(15vw-48px)]" />

	<div class="flex xl:block justify-center items-center my-20 px-3">
		<div class="space-y-10 xl:space-y-0">
			<div class="xl:ml-[calc(15vw-48px)] space-y-2 w-full md:w-72">
				<h1 class="text-3xl font-bold">{username}</h1>

				<p class="text-secondary">Address goes here</p>

				<button
					class="border rounded-full py-2 w-28 font-semibold flex justify-center items-center text-sm"
					on:click={() => (followed = !followed)}
					><Icon icon={followed ? 'minus' : 'plus'} style="mr-1" />
					{followed ? 'Remove' : 'Follow'}
				</button>
			</div>

			<div class="space-y-5 static xl:absolute top-[255px] left-[calc(50vw-150px)]">
				<div
					id="qr"
					class="border border-lightgrey rounded-3xl flex md:p-5 justify-center items-center relative"
				>
					<div
						class="z-100 h-[300px] md:h-[342px] w-[250px] md:w-[342px] animate-pulse absolute top-0 left-0 bg-gray-400 rounded-3xl {qrSkeleton
							? 'block'
							: 'hidden'}"
					/>
				</div>

				<p class="text-secondary text-center font-semibold">Scan to pay with Bitcoin</p>

				<div
					class="bg-primary font-semibold rounded-xl text-sm py-2 px-3 flex flex-wrap justify-center items-center"
				>
					<span>{lightningAddress}</span>
					<button on:click={handleCopy}>
						<Icon icon="copy" style="ml-2" />
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<PageNotFound />
{/if}
