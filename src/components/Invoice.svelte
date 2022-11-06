<script>
	import { fly } from 'svelte/transition';
	import { Avatar, Icon } from '$comp';
	import { invoice } from '$lib/store';

	export let user;
</script>

{#if $invoice}
	<div
		class="flex flex-wrap md:flex-nowrap fixed bottom-0 border-t w-full p-4 bg-white z-50"
		in:fly
	>
		<div class="my-auto md:w-1/2">
			<div class="flex">
				<Avatar user={$invoice.user.username} size={12} />
				<h1 class="my-auto"><b>{$invoice.user.username}</b> sent an invoice</h1>
			</div>
		</div>
		<div class="mx-auto my-auto">
			<a href={`/invoice/${$invoice.uuid}`}>
				<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80 w-full">
					Pay
				</button>
			</a>
		</div>
		<button
			class="absolute right-4 top-4 ml-auto mb-auto rounded-full border font-bold hover:opacity-80 p-3"
			on:click={() => ($invoice = undefined)}
		>
			<Icon icon="close" />
		</button>
	</div>
{/if}
