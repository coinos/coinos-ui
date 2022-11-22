<script>
	import { Avatar, Icon } from '$comp';
	import { onMount } from 'svelte';
	import { format, parseISO } from 'date-fns';
	import { newPayment, txns } from '$lib/store';
	import { t } from '$lib/translations';
	import { f, s, sat, sats } from '$lib/utils';
	import { page } from '$app/stores';
	import { differenceInDays, getUnixTime, sub } from 'date-fns';
	import { goto, invalidate } from '$app/navigation';

	export let data;

	let { start, end, user } = data;
	let change = ({ target: { value } }) => goto(value);

	let presets = [
		{ title: $t('transactions.day'), start: sub(new Date(), { days: 1 }), end: null },
		{ title: $t('transactions.week'), start: sub(new Date(), { days: 7 }), end: null },
		{ title: $t('transactions.month'), start: sub(new Date(), { months: 1 }), end: null },
		{ title: $t('transactions.all'), start: sub(new Date(), { years: 5 }), end: null }
	];

	$: selection = start
		? presets.findIndex((p) => Math.abs(differenceInDays(new Date(start * 1000), p.start)) < 1)
		: 0;

	let p,
		total,
		transactions = [],
		pages = [];
	$: data && ({ page: p, pages, start, end, total, transactions: $txns } = data);

	$: $page && ($newPayment = false);
	$: $newPayment && invalidate(`/users/${user.username}`);

	$: path = $page.params.page
		? $page.url.pathname.substring(0, $page.url.pathname.lastIndexOf('/'))
		: $page.url.pathname;

	let csv = () => {
		const keys = ['hash', 'updatedAt', 'rate', 'currency', 'amount', 'fee', 'tip'];
		const csv =
			keys.map((k) => `"${k}"`).join(',') +
			'\n' +
			$txns.map((r) => keys.map((k) => `"${r[k]}"`).join(',')).join('\n');

		const filename = 'transactions.csv';
		let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			let link = document.createElement('a');
			if (link.download !== undefined) {
				let url = URL.createObjectURL(blob);
				link.setAttribute('href', url);
				link.setAttribute('download', filename);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	};
</script>

<div class="mt-24 mb-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t('transactions.header')}
	</h1>

	<div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
		<div class="flex text-md text-secondary relative">
			<div class="mx-auto flex justify-center w-full gap-1">
				{#each presets as { start, end, title }, i}
					<a
						class:active={selection === i}
						href={`/${user.username}/transactions/${getUnixTime(start) + '/'}1`}
					>
						<button class="text-sm md:text-lg rounded-full border py-2 px-4 hover:opacity-80 min-w-[72px]">
							<div class="my-auto">{title}</div>
						</button>
					</a>
				{/each}
			</div>
		</div>

		<div class="flex flex-wrap justify-center mb-8">
			{#if pages.length > 1}
				{#each pages as _, i}
					<a class="mr-1 last:mr-0" href={`${path}/${i + 1}`} class:active={parseInt(p) === i + 1}>
						<div class="border py-2 rounded-full border-2 w-12 h-12 hover:opacity-80 text-center">
							{i + 1}
						</div>
					</a>
				{/each}
			{/if}
		</div>

		<div class="text-base">
			{#each $txns as tx}
				<div class="grid grid-cols-3 border-b h-24">
					<div class="whitespace-nowrap my-auto">
						<div class="font-bold">
							{f(tx.amount * (tx.rate / sats), tx.currency)}

							{#if tx.tip}
								<span class="text-sm">
									+{f(tx.tip * (tx.rate / sats), tx.currency)}
								</span>
							{/if}
						</div>

						<div class="text-secondary">
							{sat(tx.amount)}

							{#if tx.tip}
								<span class="text-sm">
									+{sat(tx.tip)}
								</span>
							{/if}
						</div>
					</div>

					<div class="flex my-auto">
						{#if tx.with}
							<a href={`/${tx.with.username}`} class="mx-auto">
								<div class="flex">
									<div class="my-auto">
										<Avatar user={tx.with} size={20} />
									</div>
									<div class="my-auto ml-1 text-secondary">{tx.with.username}</div>
								</div>
							</a>
						{:else}
							<div class="mx-auto text-secondary flex">
								{#if tx.network === 'lightning'}
									<div class="text-5xl">⚡️</div>
								{:else}
									<div class="w-20 my-auto">
										<img src="/images/bitcoin.svg" class="border-4 border-white" />
									</div>
								{/if}

								<div class="my-auto">
									{tx.amount > 0 ? (tx.confirmed ? 'Received' : 'Pending') : 'Sent'}
								</div>
							</div>
						{/if}
					</div>

					<div class="text-secondary text-right text-sm my-auto">
						<div>
							{format(parseISO(tx.createdAt), 'h:mm aaa')}
						</div>
						<div>
							{format(parseISO(tx.createdAt), 'MMM d')}
						</div>
					</div>
				</div>
			{:else}
				<p class="text-secondary text-lg text-center">{$t('transactions.empty')}</p>
			{/each}
		</div>
		<button class="ml-auto rounded-full border py-2 px-4 w-36 hover:opacity-80 flex mx-auto" on:click={csv}>
			<Icon icon="save" style="opacity-50 mr-2 my-auto" />
			<div class="my-auto">{$t('transactions.export')}</div>
		</button>
	</div>
</div>

<style>
	.active * {
		@apply bg-black text-white border-black;
	}

	select {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
</style>
