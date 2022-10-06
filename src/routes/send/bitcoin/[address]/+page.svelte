<script>
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back } from '$lib/utils';
	export let data;

	let { address } = $page.params;
	let { currency } = data.user;
	let amount, loading;
	
	let submit = () => (loading = true);
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 mt-20 max-w-xl mx-auto">
	<div class="text-center mb-8">
		<h1 class="text-3xl md:text-4xl font-semibold mb-2">Send to</h1>
		<p class="text-lg text-secondary">{address}</p>
	</div>
	<Numpad bind:amount {currency} />

  <form method="POST" use:enhance on:submit={submit}>
		<input name="address" value={address} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<div class="flex w-full">
			<button
				type="submit"
				class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
			>
				{#if loading}
					<Spinner />
				{:else}
					Send
				{/if}
			</button>
		</div>
	</form>
</div>
