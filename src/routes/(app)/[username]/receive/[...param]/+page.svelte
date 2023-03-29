<script>
	import { Icon, Numpad, Toggle } from '$comp';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { requestRedirect } from '$lib/store';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let data;
	let type = 'lightning';

	if ($page.params.param === 'bitcoin') type = 'bitcoin';

	let { request } = data;

	let amount;

	let lightning = true;
	let { currency, username, prompt } = data.subject;
	let { rates, user } = data;
	let submit;

	$: rate = rates[currency];
	$: type = lightning ? 'lightning' : 'bitcoin';
</script>

<form method="POST" class="flex justify-center items-center mt-24 mb-3 px-3" use:enhance>
	<input type="hidden" name="amount" value={amount} />
	<input type="hidden" name="currency" value={currency} />
	<input type="hidden" name="username" value={username} />
	<input type="hidden" name="type" value={type} />

	{#if request}
		<input type="hidden" name="request_id" value={request.id} />
	{/if}

	<input type="hidden" name="prompt" value={prompt} />

	<div class="space-y-3 w-[300px] mx-auto">
		<Numpad bind:amount bind:currency bind:rate {submit} />
		<button
			bind:this={submit}
			type="submit"
			class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold
				opacity-100 hover:opacity-80"
		>
			{amount ? $t('payments.next') : $t('payments.sendersChoice')}
		</button>
	</div>
</form>
