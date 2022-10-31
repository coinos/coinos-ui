<script>
	import { Icon } from '$comp';
	import { onMount } from 'svelte';
	import { formatDistance, parseISO } from 'date-fns';
	import { newPayment } from '$lib/store';
	import { t } from '$lib/translations';
	import { f, s, sats } from '$lib/utils';
	import { page } from '$app/stores';
	import { differenceInDays, getUnixTime, sub } from 'date-fns';
	import { goto } from '$app/navigation';

	export let data;

	let { start, end, user } = data;
	let change = ({ target: { value } }) => goto(value);

	let presets = [
		{ title: 'Today', start: null, end: null },
		{ title: 'Week', start: sub(new Date(), { days: 7 }), end: null },
		{ title: 'Month', start: sub(new Date(), { months: 1 }), end: null },
		{ title: 'All', start: sub(new Date(), { years: 5 }), end: null }
	];

	$: selection = start
		? presets.findIndex((p) => Math.abs(differenceInDays(new Date(start * 1000), p.start)) < 1)
		: 0;

	let p,
		total,
		transactions = [],
		pages = [];
	$: data && ({ page: p, pages, start, end, total, transactions } = data);

	$: $page && ($newPayment = false);
	$: $newPayment && invalidate(`/users/${user.username}`);

	$: path = $page.url.pathname.substring(0, $page.url.pathname.lastIndexOf('/'));
	$: console.log(path);

	let csv = () => {
		const keys = ['hash', 'updatedAt', 'rate', 'currency', 'amount', 'fee', 'tip'];
		const csv =
			keys.map((k) => `"${k}"`).join(',') +
			'\n' +
			transactions.map((r) => keys.map((k) => `"${r[k]}"`).join(',')).join('\n');

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
		{$t('user.transactions.header')}
	</h1>

	<div class="container w-full mx-auto md:text-lg px-4 max-w-xl">
		<div class="flex text-md text-secondary flex-wrap mb-4">
			<select class="md:hidden bg-white border p-4 rounded-full" on:change={change}>
				{#each presets as { start, end, title }, i}
					<option
						selected={selection === i}
						value={`/${user.username}/transactions/${start ? getUnixTime(start) + '/' : ''}1`}
						>{title}</option
					>
				{/each}
			</select>
			<div class="hidden md:block flex flex-wrap gap-2">
				{#each presets as { start, end, title }, i}
					<a
						class:active={selection === i}
						href={`/${user.username}/transactions/${start ? getUnixTime(start) + '/' : ''}1`}
					>
						<button class="rounded-full border py-2 px-5 hover:opacity-80 mb-2">
							<div class="my-auto">{title}</div>
						</button>
					</a>
				{/each}
			</div>
			<button class="ml-auto rounded-xl border py-2 px-5 hover:opacity-80 mb-2 flex" on:click={csv}>
				<Icon icon="save" style="opacity-50 mr-2" />
				<div class="my-auto">Export</div>
			</button>
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

		<div class="text-secondary grid grid-cols-3 mb-5">
			<h2>{$t('user.transactions.AMOUNT')}</h2>
			<h2 class="text-center" />
			<h2 class="text-right">{$t('user.transactions.TIME')}</h2>
		</div>

		<div class="space-y-10">
			{#if transactions.length}
				{#each transactions as tx}
					<div class="grid grid-cols-3 border-b pb-5">
						<div class="font-bold">
							<span class="block mb-1"
								>{tx.amount > 0 ? '+' : ''}{f(tx.amount * (tx.rate / sats), tx.currency)}
							</span>

							<span class="text-secondary"
								>{tx.amount > 0 ? '+' : ''}{s(tx.amount)}
								SAT
							</span>
						</div>

						<div class="text-center">
							<span class="text-secondary"
								>{$t('user.transactions.' + (tx.amount < 0 ? 'sent' : 'received'))}</span
							>
						</div>

						<div class="text-secondary text-right">
							{formatDistance(parseISO(tx.createdAt), new Date(), {
								includeSeconds: true,
								addSuffix: true
							})}
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-secondary text-lg text-center">{$t('user.transactions.empty')}</p>
			{/if}
		</div>
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
