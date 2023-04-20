<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { post } from '$lib/utils';
	import { goto } from '$app/navigation';

	export let data;

	let amount = 22000;
	let {
		currency,
		account: { balance },
		username
	} = data.user;

	let { tickets } = data;
	let ticket = tickets.length;
</script>

<div class="mx-auto h-screen flex items-center justify-center px-4">
	<div class="font-normal text-gray-800 mx-auto mb-8 space-y-8">
		<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center">
			Purchase Ticket
		</h1>

		<img
			src={`/tickets/${(ticket + 1).toString().padStart(2, '0')}.png`}
			class="w-full max-w-[800px]"
			alt="Ticket"
		/>

		{#if balance >= amount}
			<form action="?/internal" method="POST" use:enhance>
				<input type="hidden" name="username" value={username} />

				<div class="w-full flex">
					<button
						class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl"
					>
						Count me in
					</button>
				</div>
			</form>
		{:else}
			<h1 class="mb-4 text-xl font-bold leading-none tracking-tight text-gray-800 text-center">
				Payment Options
			</h1>

			<div class="flex justify-center gap-4">
				<form action="?/lightning" method="POST">
					<input type="hidden" name="currency" value={currency} />
					<input type="hidden" name="username" value={username} />
					<button class="border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl">
						Lightning
					</button>
				</form>

				<a href={`purchase/card`}>
					<button class="border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl">
						Credit Card
					</button>
				</a>
			</div>
		{/if}
	</div>
</div>
