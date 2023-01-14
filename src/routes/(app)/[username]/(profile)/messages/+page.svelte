<script>
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { format, parseISO } from 'date-fns';
	import { scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Icon } from '$comp';
	import { back, failure, focus } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';
	import { messages, password } from '$lib/store';
	import { tick, onMount } from 'svelte';
	import { calculateId } from 'nostr';

	export let data;
	export let form;

	let { newMessages, subject, user } = data;
	let input, pane;

	$: initialize($password);
	let initialize = async (p) => {
		if (!p) return;
		$messages[user.pubkey] = $messages[user.pubkey] || {};
		$messages[user.pubkey][subject.pubkey] = $messages[user.pubkey][subject.pubkey] || {};

		for (let m of newMessages) {
			if (!$messages[user.pubkey][subject.pubkey][m.id]) {
				m.message = await decrypt({ event: m, user });
				$messages[user.pubkey][subject.pubkey][m.id] = m;
				tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
			}
		}
		tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
	};

	$: events =
		($messages[user.pubkey] &&
			$messages[user.pubkey][subject.pubkey] &&
			Object.values($messages[user.pubkey][subject.pubkey]).sort(
				(a, b) => a.created_at - b.created
			)) ||
		[];

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
		$messages[user.pubkey][subject.pubkey][event.id] = event;
		$messages = $messages;
		tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));

		try {
			event.content = await encrypt({ message, recipient: subject.pubkey, user });
			await sign({ event, user });
			await send(event);

			sent = true;
		} catch (e) {
			failure('Failed to send message');
			delete $messages[user.pubkey][subject.pubkey][event.id];
			$messages = $messages;
		}

		message = '';
		submitting = false;
	};
</script>

<div class="container max-w-lg px-4 mx-auto mt-10 space-y-5">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
		{$t('payments.sendMessage')}
	</h1>

	<div class="max-h-[calc(50vh)] overflow-y-scroll p-4" bind:this={pane}>
		{#each events as data}
			{@const ours = data.pubkey === user.pubkey}
			{@const theirs = !ours}
			<div class="rounded-2xl p-4 max-w-[300px] mb-1 text-md" class:ours class:theirs>
				{#if data.message}
					{data.message}
				{:else}
					-
				{/if}
			</div>
			<div class="text-sm text-gray-400 mb-6" class:text-right={ours}>
				{format(new Date(data.created_at * 1000), 'MMM d')},
				{format(new Date(data.created_at * 1000), 'h:mm aa')}
			</div>
		{/each}
	</div>

	<form method="POST" class="space-y-5" on:submit|preventDefault={submit}>
		<input type="hidden" name="requester_id" value={user.id} />
		<input type="hidden" name="recipient" value={subject.username} />

		<input
			use:focus
			name="message"
			placeholder={$t('payments.sendMessage')}
			class="w-full p-4 border rounded-xl"
			bind:value={message}
			bind:this={input}
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
