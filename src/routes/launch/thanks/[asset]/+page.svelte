<script>
	import { page } from '$app/stores';

	export let data;
	let { user } = data;
	let { asset } = $page.params;
</script>

<div class="container mx-auto max-w-lg px-4 mt-20">
	<div class="font-normal text-gray-800 mx-auto mb-8 space-y-8">
		<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
			Thanks!
		</h1>

		<p>We look forward to seeing you!</p>

		<p>
			We've minted your ticket as an <a
				href={`https://blockstream.info/liquid/asset/${asset}`}
				class="underline">NFT on the Liquid Blockchain</a
			> as a proof of purchase and commemorative token. It may confer some special benefits in the future.
		</p>
	</div>

	<div class="w-full flex">
		<a href={`/${user.username}/dashboard`} class="mx-auto">
			<button
				class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 text-2xl"
			>
				Done
			</button>
		</a>
	</div>
</div>
