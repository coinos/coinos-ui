<script>
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back, s, sat } from '$lib/utils';
	import { pin } from '$lib/store';

	export let data;
	export let form;

	let { address, amount } = $page.params;
	let { balance, currency } = data.user;
	let loading, submit;

	let toggle = () => (loading = true);

	$: update(form);
	let update = () => {
		if (form?.message.includes('pin')) $pin = undefined;
		loading = false;
	};

let max = () => (amount = balance);
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

{#if form?.message}
	<div class="text-red-600 text-center">
		{form.message}
	</div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-5">
	<div class="text-center mb-8">
		<h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t('payments.send')}</h1>
		<p class="text-lg text-secondary">{address}</p>
	</div>


  <Numpad bind:amount {currency} {submit} />

	<form method="POST" use:enhance on:submit={toggle}>
		<input name="ts" value={Date.now()} type="hidden" />
		<input name="address" value={address} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<input name="pin" value={$pin} type="hidden" />

		<div class="flex justify-center gap-2">
			<button
				type="button"
				class="hover:opacity-80 bg-black text-white rounded-2xl py-3 px-4 mt-2 border font-bold"
				on:click|preventDefault={max}
				on:keydown={max}>Max ⚡️{s(balance)}</button
			>

			<button
				bind:this={submit}
				type="submit"
				class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24"
				disabled={loading}
			>
				{#if loading}
					<Spinner />
				{:else}
					{$t('payments.send')}
				{/if}
			</button>
		</div>
	</form>
</div>
