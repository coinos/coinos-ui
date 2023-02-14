<script>
	import { Avatar, Balance, Feed } from '$comp';
	import { t } from '$lib/translations';
	import { f, sat, sats } from '$lib/utils';

	export let data;
	let { events, invoices, sent, received, subject, user } = data;
</script>

<div class="flex justify-center lg:justify-start">
	{#if user?.id === subject.id}
		<Balance {user} />
	{/if}
</div>

<div>
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
