<script>
	import { t } from '$lib/translations';
	import { f, sat, sats } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import { Avatar, Icon } from '$comp';
	import { invoice } from '$lib/store';
</script>

{#if $invoice}
	<div class="fixed bottom-0 border-t w-full p-4 bg-white z-50" in:fly>
		<div class="flex flex-wrap md:flex-nowrap max-w-xl mx-auto gap-2">
			<div class="my-auto mx-auto">
				<div class="flex">
					<Avatar user={$invoice.user.username} size={12} />
					<h1 class="my-auto">
						<b>{$invoice.user.username}</b>
						{$t('payments.isRequesting')}
						<b>{f(($invoice.amount * $invoice.rate) / sats, $invoice.currency)}</b>
						{sat($invoice.amount)}
					</h1>
				</div>
			</div>
			<div class="mx-auto my-auto flex gap-2">
				<a href={`/invoice/${$invoice.id}/tip`}>
					<button class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-32">
						{$t('payments.pay')}
					</button>
				</a>
			</div>
		</div>
	</div>
{/if}
