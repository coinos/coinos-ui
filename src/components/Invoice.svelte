<script>
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
						<b>{$invoice.user.username}</b> sent an invoice for
						<b>{f(($invoice.amount * $invoice.rate) / sats, $invoice.currency)}</b>
						{sat($invoice.amount)}
					</h1>
				</div>
			</div>
			<div class="mx-auto my-auto flex gap-2">
				<a href={`/invoice/${$invoice.uuid}/tip`}>
					<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80 w-40">
						Pay
					</button>
				</a>
			</div>
		</div>
	</div>
{/if}
