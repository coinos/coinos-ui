<script>
	import { Balance, Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, subject, user } = data;
</script>

<div class="flex justify-center lg:justify-start">
	<Balance {user} />
</div>
