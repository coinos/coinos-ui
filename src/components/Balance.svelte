<script>
	import { Pin } from '$comp';
	import { f, s, sat, sats } from '$lib/utils';
	import { animatedRate, pin } from '$lib/store';
	import { t } from '$lib/translations';

	let show;
	export let user;
</script>

{#if show && user.haspin && $pin?.length !== 6}
	<Pin />
{/if}

<div class="space-y-2">
	{#if user.haspin && !$pin}
		<button
			class="text-sm md:text-lg rounded-full border py-2 px-4 hover:opacity-80 min-w-[72px] bg-black text-white"
			on:click={() => (show = true)}>Show Balance</button
		>
	{:else}
		<div class="text-5xl font-bold tabular-nums">
			{#if isNaN($animatedRate)}
				<div class="text-gray-200">&mdash;</div>
			{:else}
				{f((user.balance * $animatedRate) / sats, user.currency)}
			{/if}
		</div>

		<div class="text-secondary text-2xl">
			⚡️{s(user.balance)}
		</div>
	{/if}
</div>
