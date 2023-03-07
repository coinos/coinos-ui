<script>
	import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { format } from 'date-fns';
	import { scale, fade, fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Avatar, Icon } from '$comp';
	import { back, fail, focus } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';
	import { event as e, password } from '$lib/store';
	import { tick, onMount } from 'svelte';
	import { calculateId } from 'nostr';

	export let data;

	function fadeScale(node, { delay = 0, duration = 200, easing = (x) => x, baseScale = 0 }) {
		const o = +getComputedStyle(node).opacity;
		const m = getComputedStyle(node).transform.match(/scale\(([0-9.]+)\)/);
		const s = m ? m[1] : 1;
		const is = 1 - baseScale;

		return {
			delay,
			duration,
			css: (t) => {
				const eased = easing(t);
				return `opacity: ${eased * o}; transform: scale(${eased * s * is + baseScale})`;
			}
		};
	}

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

		message = '';

		event.author = user;
		event.recipient = subject;

		messages.push(event);
		messages = messages;
		tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));

		try {
			event.id = await calculateId(event);
			event.content = await encrypt({ message: event.message, recipient: subject.pubkey, user });
			await sign({ event, user });
			await send(event);

			sent = true;
		} catch (e) {
			console.log(e);
			fail('Failed to send message');
		}

		message = '';
		submitting = false;
	};

	let keydown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			submit();
		}
	};
</script>

<div class="container max-w-xl mx-auto px-4 space-y-5">
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
					in:fadeScale={{
						easing: cubicInOut,
						baseScale: 0.5
					}}
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

	<form
		method="POST"
		class="w-full border rounded-xl outline-none gap-4 flex p-0 pr-2"
		on:submit|preventDefault={submit}
	>
		<input type="hidden" name="requester_id" value={user.id} />
		<input type="hidden" name="recipient" value={subject.username} />

		<div
			use:focus
			contenteditable
			class="grow break-all py-4 outline-none mt-0 pl-4"
			bind:innerHTML={message}
			on:keydown={keydown}
		/>
		<button type="submit" class="my-auto shrink-0">
			<Icon icon="send" style="w-8" />
		</button>
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
