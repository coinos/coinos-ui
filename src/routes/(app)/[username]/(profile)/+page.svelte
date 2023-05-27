<script>
	import { onMount } from 'svelte';
	import { Icon, Avatar, Balance, Feed } from '$comp';
	import { t } from '$lib/translations';
	import { ease, f, sat, sats } from '$lib/utils';
	import { sign, send, encrypt, decrypt } from '$lib/nostr';
	import { event as e, password, rate, animatedRate } from '$lib/store';
	import { browser } from '$app/environment';

	export let data;
	let { messages, notes, invoices, sent, received, subject, user, rates } = data;
	$: refresh(data);
	let refresh = (d) => ({ messages, notes, invoices, sent, received, subject, user, rates } = d);

	let keys = new Set();
	let latest = [];
	let ready;

	e.subscribe(async (event) => {
		if (!(event && ready)) return;
		if (event.recipient?.id === user.id && !~latest.findIndex((m) => m.id === event.id)) {
			event.content = await decrypt({ event, user });

			let i = latest.findIndex((m) => m.pubkey === event.pubkey);
			let popped;
			if (~i) popped = latest.splice(i, 1);
			else popped = latest.pop();

			latest.unshift(event);
			latest = latest;
		}
	});

	$: initialize($password);
	let initialize = async (p) => {
		let i = 0;
		ready = false;
		if (!p || !user) return;
		while (i < messages.length) {
			let event = messages[i];
			i++;

			if (!(event.author && event.recipient)) continue;

			let k = event.author.id === user.id ? event.recipient?.pubkey : event.author.pubkey;
			if (!keys.has(k)) {
				keys.add(k);
				event.content = await decrypt({ event, user });
				if (event.content) latest.push(event);
			}
		}

		latest = latest;
		ready = true;
	};

	let i;
	let o;

	rate.subscribe((n) => {
		if (!user?.currency) return;
		clearInterval(i);

		let r = ((rates[user.currency] / rates['USD']) * n).toFixed(2);

		if (!r || isNaN(r)) return;
		if (!o) o = r;

		let t = 0;
		let d = o - r;

		i = setInterval(() => {
			if (!r) return;
			$animatedRate = (o - d * ease(t / 100)).toFixed(2);
			if (t > 80) (o = r) && clearInterval(i);
			t++;
		}, 10);
	});
</script>

<div class="space-y-8">
	{#if user?.id === subject.id}
		<div>
			<div class="flex justify-center lg:justify-start mb-8">
				<Balance {user} />
			</div>

			{#if !user.balance}
				<div class="mb-8">
					<p class="text-secondary text-lg">
						{$t('user.welcome')}
					</p>
				</div>
			{/if}

			<div class="flex flex-wrap gap-4 justify-center w-full">
				<a href={`/${user.username}/receive`} class="w-full md:w-60">
					<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-full md:w-60">
						<div class="mx-auto flex">
							<Icon icon="numpad" style="my-auto h-6 mr-2" />
							<div class="my-auto mt-1">{$t('user.requestPayment')}</div>
						</div>
					</button>
				</a>
				<a href={`/scan`} class="w-full md:w-60">
					<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-full md:w-60">
						<div class="mx-auto flex">
							<Icon icon="scan" style="my-auto h-6 mr-2" />
							<div class="my-auto mt-1">{$t('user.send.scan')}</div>
						</div>
					</button>
				</a>

				{#if user.eligible}
					<a href={`/buy`}>
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<!-- <Icon icon="plus" style="my-auto h-6 mr-2" /> -->

								<img
									src="/images/bitcoin.svg"
									class="w-8 border-4 border-transparent mr-2"
									alt="Bitcoin"
								/>
								<div class="my-auto mt-1">Buy Bitcoin</div>
							</div>
						</button>
					</a>
				{/if}
			</div>
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

	{#if latest.length && user?.id === subject.id}
		<div class="relative">
			{#each latest as { content, pubkey, author, recipient }}
				{@const user = author.id === user.id ? recipient : author}
				<a href={`/${user.username}/messages`}>
					<div class="flex hover:bg-gray-100 p-4 rounded-2xl">
						<div class="my-auto">
							<Avatar {user} size={'20'} disabled={true} />
						</div>
						<div class="my-auto truncate">
							<div class="my-auto ml-1 text-lg font-bold">{user.username}</div>
							<div class="my-auto ml-1 text-secondary text-lg truncate">
								{content}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		@apply mb-2;
	}
</style>
