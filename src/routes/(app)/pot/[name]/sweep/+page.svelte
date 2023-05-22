<script>
	import { scale } from 'svelte/transition';
	import { fiat, f, s } from '$lib/utils';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';

  export let data;

  let { amount, name, user, rates } = data;
  let { currency } = user;
  $: rate = rates[currency];
</script>


<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5 text-center">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

  <div class="flex w-full py-5 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
    <Icon icon="check" style="mx-auto" />
  </div>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">{$t('payments.fundsClaimed')}</h1>
  <h2 class="text-2xl md:text-3xl font-semibold">
    {f(fiat(amount, rate), currency)}
  </h2>
  <h3 class="text-secondary md:text-lg mb-6 mt-1">
    ⚡️{s(amount)}
  </h3>
  </div>

<a href={`/${user.username}/payments`}>
	<div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>

<div class="fixed bottom-10 w-full text-center">{$t('payments.tapAnywhere')}</div>
