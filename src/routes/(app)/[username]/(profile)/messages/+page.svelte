<script>
	import { t } from '$lib/translations';
	import { format, parseISO } from 'date-fns';
	import { scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Icon } from '$comp';
	import { back, failure } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';

	export let data;
	export let form;

	const scrollToBottom = (node) => {
		const scroll = () =>
			node.scroll({
				top: node.scrollHeight,
				behavior: 'smooth'
			});
		scroll();

		return { update: scroll };
	};

	let { messages, subject, user } = data;

	let sent, submitting, message;
	let submit = async () => {
		submitting = true;

		let event = {
			pubkey: user.pubkey,
			created_at: Math.floor(Date.now() / 1000),
			kind: 4,
			tags: [['p', subject.pubkey]]
		};

		event.message = message;
		messages.push(event);
		messages = messages;

		try {
			event.content = await encrypt({ message, recipient: subject.pubkey, user });
			await sign({ event, user });
			await send(event);

			sent = true;
		} catch (e) {
			failure('Failed to send message');
			messages.pop();
			messages = messages;
		}

		submitting = false;
	};
</script>

<div class="container max-w-lg px-4 mx-auto mt-10 space-y-5">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
		{$t('transactions.sendMessage')}
	</h1>

	<div class="max-h-[calc(50vh)] overflow-y-scroll p-4" use:scrollToBottom={messages}>
		{#each messages as event}
			{@const ours = event.pubkey === user.pubkey}
			{@const theirs = !ours}
			<div class="rounded-2xl p-4 max-w-[300px] mb-1 text-md" class:ours class:theirs>
				{#if event.message}
					{event.message}
				{:else}
					{#await decrypt({ event, user })}
						-
					{:then message}
						{(event.message = message) && ''}
						{event.message}
					{/await}
				{/if}
			</div>
			<div class="text-sm text-gray-400 ml-2 mb-6">
				{format(new Date(event.created_at * 1000), 'MMM d')},
				{format(new Date(event.created_at * 1000), 'h:mm aa')}
			</div>
		{/each}
	</div>

	<form method="POST" class="space-y-5" on:submit|preventDefault={submit}>
		<input type="hidden" name="requester_id" value={user.id} />
		<input type="hidden" name="recipient" value={subject.username} />

		<input
			name="message"
			placeholder={$t('transactions.sendMessage')}
			class="w-full p-4 border rounded-xl"
			bind:value={message}
		/>
	</form>
</div>

<style>
	.ours {
		@apply bg-gray-100 rounded-br-none ml-auto;
	}

	.theirs {
		@apply bg-gray-200 rounded-bl-none;
	}
</style>
