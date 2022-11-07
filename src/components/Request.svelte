<script>
	import { fly } from 'svelte/transition';
	import { Avatar, Icon } from '$comp';
	import { request } from '$lib/store';

	export let user;
</script>

{#if $request}
	<div class="fixed bottom-0 border-t w-full p-4 bg-white z-50" in:fly>
		<div class="flex flex-wrap md:flex-nowrap max-w-xl mx-auto gap-2">
			<div class="my-auto mx-auto">
				<div class="flex">
					<Avatar user={$request.requester} size={12} />
					<h1 class="my-auto"><b>{$request.requester.username}</b> is ready to pay</h1>
				</div>
				{#if $request.memo}
					<div class="border-l-4 pl-4 my-2">{$request.memo}</div>
				{/if}
			</div>
			<div class="mx-auto my-auto flex gap-2">
				<a href={`/${user.username}/receive`}>
					<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80 w-40">
						Invoice
					</button>
				</a>
				<button
					class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80 w-full"
					on:click={() => ($request = undefined)}
				>
					Dismiss
				</button>
			</div>
		</div>
	</div>
{/if}
