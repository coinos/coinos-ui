<script>
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Avatar, Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';
	import { types, copy, f, s, sat, sats } from '$lib/utils';
	import { loginRedirect } from '$lib/store';

	export let data;

	let { amount, src, payments, rates, user } = data;
	let { name } = $page.params;

	toast.pop(0);

	let currency = user ? user.currency : 'CAD';
	let rate = rates[currency];

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
	$loginRedirect = $page.url.pathname;

	let show;
	let toggle = () => (show = !show);
</script>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
	<div class="flex justify-center items-center">
		<div class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5">
			<div class="relative flex justify-center gap-2">
				<!-- <p class="absolute right-0 top-1 underline"><Icon icon="settings" /></p> -->
        {#if name.split('-').length === 4}
          <h1 class="text-2xl md:text-3xl font-semibold my-auto">Card {name}</h1>
				{:else}
					<img src="/images/moneypot.jpg" class="w-24" />
          <div class="my-auto">
            <h1 class="text-2xl font-semibold my-auto">{$t('payments.moneyPot')}</h1>
          <h1 class="text-secondary my-auto">{name}</h1>
          </div>
				{/if}
			</div>
			{#if show}
				<img {src} class="mx-auto" alt={name} />
			{/if}
			<div class="flex justify-center gap-4">
				<div class="my-auto">
					<h2 class="text-2xl md:text-3xl font-semibold">
						{f(amountFiat, currency)}
					</h2>
					<h3 class="text-secondary md:text-lg mt-1">
						{sat(amount)}
					</h3>
				</div>
			</div>
			<div class="flex gap-2" data-sveltekit-prefetch="off">
				<div class="grow">
					<a href={`/send/pot/${name}`}>
						<button
							class="rounded-full border py-3 px-2 font-bold hover:opacity-80 flex gap-1 w-full justify-center"
						>
							<Icon icon="plus" />
              {$t('payments.addFunds')}
						</button>
					</a>
				</div>
				<div class="grow">
					<a href={`/pot/${name}/withdraw`}>
						<button
							class="rounded-full border py-3 px-2 font-bold hover:opacity-80 flex gap-1 w-full justify-center"
						>
							<Icon icon="minus" style="rotate-180" />
              {$t('payments.takeFunds')}
						</button>
					</a>
				</div>
			</div>
			<div class="flex gap-2" data-sveltekit-prefetch="off">
				<button
					class="rounded-full border py-3 px-2 font-bold hover:opacity-80 flex gap-1 w-full justify-center"
					on:click={toggle}
				>
					<Icon icon="qr" style="invert" />
					{show ? $t('payments.show') : $t('payments.hide')} QR
				</button>
				<button
					class="rounded-full border py-3 px-2 font-bold hover:opacity-80 flex gap-1 w-full justify-center"
          on:click={() => copy($page.url.pathname)}
				>
					<Icon icon="copy" style="w-6" />
          {$t('payments.copyLink')}
				</button>
			</div>
			<div class="text-base">
				{#each payments as p}
					<a href={`/payment/${p.id}`}>
						<div class="grid grid-cols-3 border-b h-24 hover:bg-gray-100 px-4">
							<div class="whitespace-nowrap my-auto">
								<div class="font-bold" class:text-red-800={p.amount > 0}>
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
								<div class="flex">
									<div class="my-auto">
										<Avatar user={p.user} size={16} disabled={true} />
									</div>
									<div class="my-auto ml-1 text-secondary">{p.user.username}</div>
								</div>
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
		</div>
	</div>
</div>
