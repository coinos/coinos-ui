<script>
	import { selectedRate } from '$lib/store';
	import { post } from '$lib/utils';
	export let data;

	let amount = 35000;
	let {
		account: { balance },
		username
	} = data.user;

	let invoice;
	let get = async (network) => {
		invoice = await post('/invoice', {
			amount,
			rate: $selectedRate,
			network,
			username
		});
	};

	let lightning = () => get('lightning');
	let bitcoin = () => get('bitcoin');

	// if (balance < amount) throw redirect(307, `/${username}/fund/${amount - balance}`);
</script>

<div class="mx-auto h-screen flex items-center justify-center px-8">
	<div class="flex w-full bg-white rounded shadow-lg">
		<div class="p-4 font-normal text-gray-800 mx-auto mb-8">
			{#if balance > amount}
				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
					Buy Your Launch Party Ticket?
				</h1>

				<div class="text-center text-4xl mb-12">{amount} sats</div>

				<div class="w-full flex">
					<button
						class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl"
					>
						Count me in
					</button>
				</div>
			{:else}
				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
					Ticket Price
				</h1>
				<div class="text-center text-4xl mb-12">{amount} sats</div>

				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
					Your Balance
				</h1>

				<div class="text-center text-4xl mb-12">{balance} sats</div>

				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
					Funding Options
				</h1>

				<button
					class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl"
					on:click={lightning}
				>
					Lightning
				</button>

				<button
					class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl"
					on:click={bitcoin}
				>
					Bitcoin
				</button>
			{/if}
		</div>
	</div>
</div>
