<script>
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Icon, Numpad, Spinner } from '$comp';
	import { page } from '$app/stores';
	import { back } from '$lib/utils';
	import { pin } from '$lib/store';

	export let data;
	export let form;

	let { amount, name } = $page.params;
	let { currency } = data.user;
	let loading;

	let submit = () => (loading = true);
	$: update(form);
	let update = () => {
		if (form?.message?.includes('pin')) $pin = undefined;
		loading = false;
	};
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

{#if form?.message}
	<div class="text-red-600 text-center">
		{form.message}
	</div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
	<Numpad bind:amount {currency} />

	<form method="POST" use:enhance on:submit={submit}>
		<input name="name" value={name} type="hidden" />
		<input name="amount" value={amount} type="hidden" />
		<input name="pin" value={$pin} type="hidden" />

		<div class="flex w-full">
			<button
				type="submit"
				class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
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
