<script>
	import { t } from '$lib/translations';
	import { back, copy, f, s, sats } from '$lib/utils';
	import { Avatar, Icon } from '$comp';
	import { format } from 'date-fns';
	import { PUBLIC_EXPLORER as expl } from '$env/static/public';

	export let data;
	let { user, payment: p } = data;
	let { username } = user;
	let { id, amount, created, rate, type, ref, fee, currency } = p;
	fee = fee || 0;

	let total = amount > 0 ? amount : -amount + fee;
	let fiat = (total * rate) / sats;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container mx-auto max-w-lg px-4 space-y-2 sm:space-y-5 break-all text-center">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
		{$t(amount < 0 ? 'payments.sent' : 'payments.received')}
	</h1>

	{#if p.with}
		<div class="flex justify-center">
			<div class="my-auto">
				<Avatar user={p.with} />
			</div>
			<div class="my-auto ml-1 text-secondary">{p.with.username}</div>
		</div>
	{/if}

	<div>
		<div class="text-xl">
			{f(fiat, currency)}
			<span class="text-secondary">⚡️{`${s(total)}`}</span>
		</div>
	</div>

	<div>
		<div>
			{format(new Date(created), 'MMMM d')},
			{format(new Date(created), 'h:mm aaa')}
		</div>
	</div>

	{#if type === 'lightning'}
		<div>
			<div class="font-bold">{$t('payments.preimage')}</div>
			<div>
				{ref}
			</div>
		</div>
	{:else if type === 'bitcoin'}
		<div>
			<div class="flex">
				<div>
					<a href={`${expl}/payment/${id}`} target="_blank" rel="noreferrer">{id}</a>
				</div>
				<button class="flex font-bold hover:opacity-80 mb-auto" on:click={() => copy(id)}
					><Icon icon="copy" style="ml-2" />
				</button>
			</div>
		</div>
	{/if}
</div>
