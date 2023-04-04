<script>
	import { format } from 'date-fns';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Avatar, Icon } from '$comp';
	import { toast } from '@zerodevx/svelte-toast';
	import { t } from '$lib/translations';
	import { copy, f, s, sat, sats } from '$lib/utils';
	import { loginRedirect } from '$lib/store';

	export let data;

	let { amount, src, payments, rates, user } = data;
	let { name } = $page.params;

	toast.pop(0);

	let currency = user ? user.currency : 'CAD';
	let rate = rates[currency];

	$: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
	$loginRedirect = $page.url.pathname;
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center text-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<div class="relative">
				<!-- <p class="absolute right-0 top-1 underline"><Icon icon="settings" /></p> -->
				<h1 class="text-2xl md:text-3xl font-semibold">Public Pot</h1>
			</div>
			<p class="text-secondary">Anyone who knows the URL to this pot can add or take out funds</p>
			<img {src} class="mx-auto" alt={name} />
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
			<div class="mx-auto my-auto flex gap-2 justify-center" data-sveltekit-prefetch="off">
				<a href={`/send/pot/${name}`}>
					<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80">
						Chip in
					</button>
				</a>
				<a href={`/pot/${name}/withdraw`}>
					<button class="text-lg rounded-full border py-3 px-7 font-bold hover:opacity-80">
						Dip in
					</button>
				</a>
			</div>
			<div class="text-base">
				{#each payments as p}
					<a href={`/${p.user.username}`}>
						<div class="flex h-24 hover:bg-gray-100 px-4">
							<div class="flex grow">
								<div class="flex my-auto">
									<div class="my-auto">
										<Avatar user={p.user} size={12} />
									</div>
									<div class="ml-1 text-secondary my-auto">
										{p.user.username}
										{p.amount > 0 ? 'took out' : 'threw in'}
									</div>
								</div>
								<div class="text-secondary my-auto">
									{sat(p.amount)}
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
