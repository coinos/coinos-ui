<script>
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { format, parseISO } from 'date-fns';
	import { scale, fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Avatar, Icon } from '$comp';
	import { back, fail, focus } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';
	import { event as e, password } from '$lib/store';
	import { tick, onMount } from 'svelte';
	import { calculateId } from 'nostr';

	export let data;

	let { messages, subject, user } = data;
	let input, pane;

	$: initialize($password);
	let initialize = async (p) => {
		if (!p) return;
		await Promise.all(
			messages.map(async (event) => (event.message = await decrypt({ event, user })))
		);

		messages = messages;
		tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
	};

	e.subscribe(async (event) => {
		let found = ~messages.findIndex((m) => m.id === event?.id);
		if (event?.recipient.id === user.id && !found) {
			event.message = await decrypt({ event, user });
			messages.push(event);
			messages = messages;
			tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
		}
	});

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
		event.id = await calculateId(event);
		tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));

		try {
			event.content = await encrypt({ message, recipient: subject.pubkey, user });
			event.author = user;
			event.recipient = subject;
			await sign({ event, user });
			await send(event);
			messages.push(event);
			messages = messages;
			tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));

			sent = true;
		} catch (e) {
			console.log(e);
			fail('Failed to send message');
		}

		message = '';
		submitting = false;
	};
</script>

<div class="container max-w-xl mx-auto px-4">
	<div
		class="h-[50vh] max-h-[50vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-[#F2F6FC] scrollbar-track-white pr-8"
		bind:this={pane}
	>
		{#each messages as { id, author, message, created_at, pubkey }}
			{@const ours = pubkey === user.pubkey}
			{@const theirs = !ours}

			{#if message}
				<div
					class="flex gap-2"
					class:flex-row-reverse={theirs}
					class:justify-end={theirs}
					in:fade={{ duration: 150 }}
				>
					<div
						class="rounded-2xl px-4 py-2 max-w-[300px] mb-1 text-lg"
						class:ours
						class:theirs
						:key={id}
					>
						{message}
					</div>
					<div class="mt-auto">
						<Avatar user={author} size={'12'} />
					</div>
				</div>
				<div class="text-sm text-gray-400 mb-6" class:text-right={ours}>
					{format(new Date(created_at * 1000), 'MMM d')},
					{format(new Date(created_at * 1000), 'h:mm aa')}
				</div>
			{/if}
		{/each}
	</div>

	<form method="POST" class="space-y-5" on:submit|preventDefault={submit}>
		<input type="hidden" name="requester_id" value={user.id} />
		<input type="hidden" name="recipient" value={subject.username} />

		<input
			use:focus
			name="message"
			placeholder={$t('payments.sendMessage')}
			class="w-full p-4 border rounded-xl outline-none"
			bind:value={message}
			bind:this={input}
		/>
	</form>
</div>

<style>
	.ours {
		@apply bg-gradient-to-r from-[#F2F6FC] to-[#E1E3FF] text-black rounded-br-none ml-auto;
	}

	.theirs {
		@apply bg-gray-100 text-black rounded-bl-none;
	}
</style>
