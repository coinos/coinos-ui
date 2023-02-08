<script>
	import { scale } from 'svelte/transition';
	import { t } from '$lib/translations';
	import { Avatar, Icon } from '$comp';
	import { f, sat, sats } from '$lib/utils';
	import { request as req, requestRedirect } from '$lib/store';
	import { onMount } from 'svelte';

	export let data;
	let { request, user } = data;

	let amount, currency, rate, fiat;
	if (request.invoice) {
		({ amount, rate, currency } = request.invoice);
		fiat = (amount * rate) / sats;
	}

	onMount(() => req.set());
</script>

<div class="container px-4 max-w-xl mx-auto space-y-8">
	<div class="text-center mb-8 space-y-5">
		{#if request.recipient_id === user.id}
			<p class="text-4xl break-words">
				<span class="text-xl md:text-2xl">{$t('payments.sentInvoiceTo')}</span>
			</p>
			<div class="flex p-1 gap-2 justify-center">
				<Avatar user={request.requester} size={20} />
				<p class="text-4xl break-words my-auto">{request.requester.username}</p>
			</div>
			<div>
				<h2 class="text-2xl md:text-3xl font-semibold">
					{f(fiat, currency)}
				</h2>
				<h3 class="text-secondary md:text-lg mb-6 mt-1">{sat(amount)}</h3>
			</div>
		{:else}
			<div class="flex w-full max-w-[200px] mx-auto py-20" in:scale={{ start: 0.5 }}>
				<Icon icon="check" style="mx-auto" />
			</div>
			<p class="text-3xl">
				{$t('payments.sentRequestTo')}
			</p>
		{/if}
	</div>
</div>

<a href={$requestRedirect || `/${user.username}`}>
	<div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>

<div class="fixed bottom-10 left-0 text-center w-full">{$t('payments.tapAnywhere')}</div>
