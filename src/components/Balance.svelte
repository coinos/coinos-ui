<script>
	import { f, s, sat, sats } from '$lib/utils';
	import { animatedRate } from '$lib/store';
	import { t } from '$lib/translations';

	export let user;
</script>

<div class="space-y-2">
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
</div>
