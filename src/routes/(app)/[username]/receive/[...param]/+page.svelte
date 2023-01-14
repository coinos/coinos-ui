<script>
	import { Icon, Numpad } from '$comp';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { requestRedirect } from '$lib/store';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let data;
	export let form;
	let network = 'lightning';

	if ($page.params.param === 'bitcoin') network = 'bitcoin';

	let { request } = data;

	let amount;

	let { currency, username } = data.subject;
	let { user } = data;
</script>

<form method="POST" class="flex justify-center items-center mt-24 mb-3 px-3" use:enhance>
	<input type="hidden" name="amount" value={amount} />
	<input type="hidden" name="currency" value={currency} />
	<input type="hidden" name="username" value={username} />
	<input type="hidden" name="network" value={network} />

	{#if request}
		<input type="hidden" name="request_id" value={request.id} />
	{/if}

	<input type="hidden" name="prompt" value={false} />

	<div class="space-y-3 w-[300px] mx-auto">
		<Numpad bind:amount bind:currency />
		<button
			type="submit"
			class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold
				opacity-100 hover:opacity-80"
		>
			{amount ? $t('payments.next') : $t('payments.sendersChoice')}
		</button>
	</div>
</form>
