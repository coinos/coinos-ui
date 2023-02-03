<script>
	import { f, s, sat, sats } from '$lib/utils';
	import { animatedRate } from '$lib/store';
	import { t } from '$lib/translations';

	export let user;
</script>

<div class="space-y-2">
	<div class="text-5xl font-bold tabular-nums">
		{$animatedRate
			? f((user.balance * $animatedRate) / sats, user.currency)
			: $t('user.dashboard.fetchingRate')}
	</div>

	<div class="text-secondary text-2xl">
		⚡️{s(user.balance)}
	</div>
</div>
