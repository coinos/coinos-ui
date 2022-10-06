<script>
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back, s } from '$lib/utils';
	export let data;
	export let form;

	let { payreq } = $page.params;
	let { alias } = data;

	let { currency } = data.user;
	let amount = form?.amount || data.amount;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 mt-20 max-w-xl mx-auto">
	{#if amount}
		<div class="text-center mb-8">
			<h1 class="text-xl md:text-2xl text-secondary mb-2">Sending</h1>
      <p class="text-6xl break-words mb-4">{s(amount)} <span class="text-xl md:text-2xl text-secondary">sats</span></p>
      <h1 class="text-xl md:text-2xl text-secondary mb-2">to</h1>
			<p class="text-6xl break-words">{alias}</p>
		</div>
	{:else}
		<Numpad bind:amount {currency} />
	{/if}

	<form method="POST" use:enhance>
		<input name="payreq" value={payreq} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<input name="confirmed" value={form?.confirm} type="hidden" />

		<div class="flex w-full">
			<button
				type="submit"
				class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
			>
				Send
			</button>
		</div>
	</form>
</div>
