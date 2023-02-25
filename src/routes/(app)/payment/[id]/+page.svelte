<script>
	import { t } from '$lib/translations';
	import { back, copy, f, s, fiat, sats } from '$lib/utils';
	import { Avatar, Icon } from '$comp';
	import { format } from 'date-fns';
	import { PUBLIC_EXPLORER as expl } from '$env/static/public';

	export let data;
	let { user, payment: p } = data;
	let { username } = user;
	let { id, amount, created, rate, type, ref, tip, ourfee, fee, currency } = p;
	let a = Math.abs(amount);

	fee = fee || 0;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container mx-auto max-w-lg px-4 space-y-8 break-all text-2xl">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t(amount < 0 ? 'payments.sent' : 'payments.received')}
	</h1>

	{#if p.with}
		<div>
			<span class="text-lg text-secondary my-auto mr-2">{amount > 0 ? 'From' : 'To'}</span>
      <a href={`/${p.with.username}`}>
			<div class="flex">
				<div class="my-auto">
					<Avatar user={p.with} size={20} />
				</div>
				<div class="my-auto ml-1">{p.with.username}</div>
			</div>
      </a>
		</div>
	{/if}

	<div>
		<span class="text-lg text-secondary">Amount</span>
		<div>
			{f(fiat(a, rate), currency)}
			{#if tip}
        <span class="text-lg">
				+ {f(fiat(tip, rate), currency)}
        </span>
			{/if}
      <span class="text-secondary">⚡️{`${s(a)}`}
      
			{#if tip}
        <span class="text-lg">
				+ ⚡️{s(tip)}
        </span>
			{/if}
      </span>
		</div>
	</div>

	<div>
		<span class="text-lg text-secondary">Network fee</span>
		<div>
			{f(fiat(fee, rate), currency)}
			<span class="text-secondary">⚡️{`${s(fee)}`}</span>
		</div>
	</div>

	{#if ourfee > 0}
		<div>
			<span class="text-lg text-secondary">Platform fee</span>
			<div>
				{f(fiat(ourfee, rate), currency)}
				<span class="text-secondary">⚡️{`${s(ourfee)}`}</span>
			</div>
		</div>
	{/if}

	<div>
		<span class="text-lg text-secondary">Date</span>
		<div>
			{format(new Date(created), 'MMMM d')},
			{format(new Date(created), 'h:mm aaa')}
		</div>
	</div>

	{#if type === 'bitcoin'}
		<div>
			<span class="text-lg text-secondary">Txid</span>
			<div class="flex">
				<div>
					<a href={`${expl}/tx/${id}`} target="_blank" rel="noreferrer">{id}</a>
				</div>
				<button class="flex font-bold hover:opacity-80 mb-auto my-auto" on:click={() => copy(id)}
					><Icon icon="copy" style="ml-2 w-20 my-auto" />
				</button>
			</div>
		</div>
	{/if}
</div>
