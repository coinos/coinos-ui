<script>
	import { t } from '$lib/translations';
	import { back, copy, f, s, sats } from '$lib/utils';
	import { Avatar, Icon } from '$comp';
	import { format, parseISO } from 'date-fns';
	import { PUBLIC_EXPLORER as expl } from '$env/static/public';

	export let data;
	let { user, tx } = data;
	let { username } = user;
	let { amount, hash, createdAt, rate, network, preimage, fee, currency } = tx;
	let fiat = (Math.abs(amount) * rate) / sats;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container mx-auto max-w-lg px-4 space-y-2 sm:space-y-5 break-all">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t(amount < 0 ? 'payments.sent' : 'payments.received')}
	</h1>

	<div>
		<div class="font-bold">{$t('payments.amount')}</div>
		<div class="text-xl">
			{f(fiat, currency)}
			<span class="text-secondary">⚡️{`${s(Math.abs(amount) + fee)}`}</span>
		</div>
	</div>

	<div>
		<div class="font-bold">{$t('payments.date')}</div>
		<div>
			{format(parseISO(createdAt), 'MMMM d')},
			{format(parseISO(createdAt), 'h:mm aaa')}
		</div>
	</div>

	{#if network === 'lightning'}
		<div>
			<div class="font-bold">{$t('payments.preimage')}</div>
			<div>
				{preimage}
			</div>
		</div>
	{:else}
		<div>
			<div class="font-bold">{$t('payments.id')}</div>
      <div class="flex">
			<div>
				<a href={`${expl}/tx/${hash}`} target="_blank" class="text-blue-600">{hash}</a>
			</div>
			<button
				class="flex font-bold hover:opacity-80 mb-auto"
				on:click={() => copy(hash)}
				><Icon icon="copy" style="mr-1" />
			</button>
      </div>
		</div>
	{/if}
</div>
