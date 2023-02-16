<script>
	import { onMount } from 'svelte';
	import { Icon, Avatar, Balance, Feed } from '$comp';
	import { t } from '$lib/translations';
	import { f, sat, sats } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';
	import { browser } from '$app/environment';

	export let data;
	let { messages, notes, invoices, sent, received, subject, user } = data;

	let keys = new Set();
	let latest = [];
	let i = 0;

	onMount(async () => {
		if (!browser) return;
		while (latest.length < 3 && i < messages.length) {
			let event = messages[i];
			let { pubkey: k } = event.user;
			if (k !== user.pubkey && !keys.has(k)) {
				keys.add(k);
				event.content = await decrypt({ event, user });
				if (event.content) latest.push(event);
			}
			i++;
		}

		latest = latest;
	});
</script>

<div class="space-y-8">
	{#if user?.id === subject.id}
		<div>
			{#if user.balance > 0 && false}
				<h1 class="text-secondary text-xl">Balance</h1>
				<div class="flex justify-center lg:justify-start">
					<Balance {user} />
				</div>
			{:else}
				<div class="space-y-3">
					<h1 class="text-2xl">Welcome</h1>

					<p class="text-secondary">
						Get started by making a deposit or getting someone to pay you in Bitcoin!
					</p>

					<div class="flex gap-4 justify-center w-full">
						<a href={`/${user.username}/receive`}>
							<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
								<div class="mx-auto flex">
									<Icon icon="numpad" style="my-auto h-6 mr-2" />
									<div class="my-auto mt-1">Receive a Payment</div>
								</div>
							</button>
						</a>

						<!-- <a href={`/buy`}> -->
						<!-- 	<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60"> -->
						<!-- 		<div class="mx-auto flex"> -->
						<!-- 			<Icon icon="plus" style="my-auto h-6 mr-2" /> -->
						<!-- 			<div class="my-auto mt-1">Buy Bitcoin</div> -->
						<!-- 		</div> -->
						<!-- 	</button> -->
						<!-- </a> -->
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if invoices.length}
		<div>
			<h1 class="text-secondary text-xl">Invoices</h1>
			{#each invoices as { amount, currency, rate, request: { requester, recipient }, hash }}
				{@const requested = user.username === requester?.username}
				<a href={`/${recipient.username}/invoice/${hash}` + (requested ? '/tip' : '')}>
					<div class="border-b p-2 last:border-b-0 hover:bg-gray-100">
						<div class="flex gap-2">
							<div>
								{#if requested}
									<div class="flex">
										<Avatar user={recipient} size={20} />
										<div class="my-auto text-left">
											<p class="text-secondary">{$t('payments.invoiceFrom')}</p>
											<p class="ml-1 text-lg break-words">{recipient.username}</p>
										</div>
									</div>
								{:else}
									<div class="flex">
										<Avatar user={requester} size={20} />
										<div class="my-auto text-left">
											<p class="text-secondary">{$t('payments.awaiting')}</p>
											<p class="ml-1 text-lg break-words">{requester.username}</p>
										</div>
									</div>
								{/if}
							</div>
							<div class="whitespace-nowrap my-auto ml-auto flex gap-2">
								<div class="font-bold">
									{f(amount * (rate / sats), currency)}
								</div>

								<div class="text-secondary">{sat(amount)}</div>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
	{#if received.length}
		<div>
			<h1 class="text-secondary text-xl">Requests</h1>

			{#each received as { id, invoice, memo, requester: r }}
				<a href={`/${user.username}/receive/${id}`}>
					<div class="border-b p-2 last:border-b-0 hover:bg-gray-100">
						<div class="flex">
							<div>
								<div class="flex">
									<Avatar user={r} size={20} />
									<div class="my-auto text-left">
										<p class="ml-1 text-lg break-words">{r.username}</p>
										<p class="ml-1 text-secondary">{memo}</p>
									</div>
								</div>
							</div>
							<div class="whitespace-nowrap my-auto ml-auto flex gap-2">
								<button class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full"
									>Invoice</button
								>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	{#if latest.length}
		<div>
			<h1 class="text-2xl">Messages</h1>
			{#each latest as { content, user }}
				<div class="flex">
					<div class="my-auto">
						<Avatar {user} size={12} disabled={true} />
					</div>
					<div class="my-auto ml-1 text-secondary">{user.username}</div>
					{content}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		@apply mb-2;
	}
</style>
