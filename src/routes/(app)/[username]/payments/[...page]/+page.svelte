<script>
	import { Avatar, Icon } from '$comp';
	import { onMount } from 'svelte';
	import { format } from 'date-fns';
	import { newPayment, payments } from '$lib/store';
	import { t } from '$lib/translations';
	import { get, f, s, sat, sats, types } from '$lib/utils';
	import { page } from '$app/stores';
	import { differenceInDays, getUnixTime, sub } from 'date-fns';
	import { goto, invalidate } from '$app/navigation';

	export let data;

	let { start, end, user, rates } = data;

	let change = ({ target: { value } }) => goto(value);
	let link = (p) => {
		if (p.pot) return `/pot/${p.pot}`;
		if (p.with) return '/' + p.with.username;
		return `/p/${p.id}`;
	};

	let presets = [
		{ title: $t('payments.day'), start: sub(new Date(), { days: 1 }), end: null },
		{ title: $t('payments.week'), start: sub(new Date(), { days: 7 }), end: null },
		{ title: $t('payments.month'), start: sub(new Date(), { months: 1 }), end: null },
		{ title: $t('payments.all'), start: sub(new Date(), { years: 5 }), end: null }
	];

	$: selection = start
		? presets.findIndex((p) => Math.abs(differenceInDays(new Date(start * 1000), p.start)) < 1)
		: 0;

	let p,
		totals,
		pages = [];
	$: data && ({ page: p, pages, start, end, totals, payments: $payments } = data);

	$: $page && ($newPayment = false);
	$: $newPayment && invalidate(`/users/${user.username}`);

	$: path = $page.params.page
		? $page.url.pathname.substring(0, $page.url.pathname.lastIndexOf('/'))
		: $page.url.pathname;

	let csv = async () => {
		let url = `/${user.username}/payments`;
		if (start) url += `/${start}`;
		if (end) url += `/${end}`;

		let { payments } = await get(url);

		payments = payments.map((p) => ({
			...p,
			created: new Date(p.created),
			total: p.amount + (p.tip || 0),
			amount_fiat: f((p.amount * p.rate) / sats, p.currency),
			fee_fiat: p.fee ? f((p.fee * p.rate) / sats, p.currency) : null,
			tip_fiat: p.tip ? f((p.tip * p.rate) / sats, p.currency) : null,
			total_fiat: f(((p.amount + (p.tip || 0)) * p.rate) / sats, p.currency)
		}));

		let keys = [
			'type',
			'id',
			'created',
			'rate',
			'currency',
			'amount',
			'tip',
			'total',
			'fee',
			'amount_fiat',
			'tip_fiat',
			'total_fiat',
			'fee_fiat'
		];

		let csv =
			keys.map((k) => `"${k}"`).join(',') +
			'\n' +
			payments.map((r) => keys.map((k) => `"${r[k] || ''}"`).join(',')).join('\n');

		let filename = 'payments.csv';
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
		{$t('payments.header')}
	</h1>

	<div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
		<div class="flex text-md text-secondary relative">
			<div class="mx-auto flex justify-center w-full gap-1">
				{#each presets as { start, end, title }, i}
					<a
						class:active={selection === i}
						href={`/${user.username}/payments/${getUnixTime(start) + '/'}1`}
					>
						<button
							class="text-sm md:text-lg rounded-full border py-2 px-4 hover:opacity-80 min-w-[72px]"
						>
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
			{#each $payments as p}
				<a href={`/payment/${p.id}`}>
					<div class="grid grid-cols-3 border-b h-24 hover:bg-gray-100 px-4">
						<div class="whitespace-nowrap my-auto">
							<div class="font-bold" class:text-red-800={p.amount < 0}>
								{f(Math.abs(p.amount) * (p.rate / sats), p.currency)}
								{#if p.tip}
									<span class="text-sm text-secondary">
										+{Math.round((p.tip / Math.abs(p.amount)) * 100)}%
									</span>
								{/if}
							</div>

							<div class="text-secondary">
								{sat(Math.abs(p.amount) + (p.tip || 0))}
							</div>
						</div>

						<div class="flex my-auto">
							{#if p.type === types.pot}
								<a href={`/pot/${p.memo}`}>
									<div class="text-secondary flex">
										<div class="my-auto mr-1">
											<img src="/images/moneypot.png" class="w-12" alt="Pot" />
										</div>

										<div class="my-auto">Pot</div>
									</div>
								</a>
							{:else if p.with}
								<div class="flex">
									<div class="my-auto">
										<Avatar user={p.with} size={16} disabled={true} />
									</div>
									<div class="my-auto ml-1 text-secondary">{p.with.username}</div>
								</div>
							{:else if p.type === types.classic}
								<img
									src="/images/classic.png"
									class="w-24 border-4 border-transparent mr-1"
									alt="Bitcoin"
								/>
								<div class="my-auto text-secondary">{p.memo}</div>
							{:else}
								<div class="text-secondary flex">
									{#if p.type === types.lightning}
										<div class="text-3xl">⚡️</div>
									{:else if p.type === types.bitcoin}
										<div class="my-auto mr-1">
											<img
												src="/images/bitcoin.svg"
												class="w-12 border-4 border-transparent"
												alt="Bitcoin"
											/>
										</div>
									{/if}

									<div class="my-auto">
										{p.amount > 0 ? (p.confirmed ? 'Received' : 'Pending') : 'Sent'}
									</div>
								</div>
							{/if}
						</div>

						<div class="text-secondary text-right text-sm my-auto">
							<div>
								{format(new Date(p.created), 'h:mm aaa')}
							</div>
							<div>
								{format(new Date(p.created), 'MMM d')}
							</div>
						</div>
					</div>
				</a>
			{:else}
				<p class="text-secondary text-lg text-center">{$t('payments.empty')}</p>
			{/each}
		</div>

		<div class="grid grid-cols-3 w-full text-center">
      <span class="text-lg text-secondary">{$t('payments.total')}</span>
			<span class="text-lg text-secondary">{$t('payments.presentValue')}</span>
			<span class="text-lg text-secondary">{$t('payments.gainLoss')}</span>

			{#each Object.keys(totals) as c}
				{@const total = totals[c]['fiat']}
				{@const pv = (totals[c]['sats'] * rates[c]) / sats}
				{@const gain = (pv * 100) / total - 100}
				<span class="text-lg"><b>{f(total, c)}</b></span>
				<span class="text-lg"><b>{f(pv, c)}</b></span>
				<span class="text-lg" class:text-red-800={gain < 0}><b>{Math.abs(gain).toFixed(2)}%</b></span>
			{/each}
		</div>

		<button
			class="ml-auto rounded-full border py-2 px-4 w-36 hover:opacity-80 flex mx-auto"
			on:click={csv}
		>
			<Icon icon="save" style="opacity-50 mr-2 my-auto" />
			<div class="my-auto">{$t('payments.export')}</div>
		</button>
	</div>
</div>

<style>
	.active * {
		@apply bg-black text-white border-black;
	}
</style>
