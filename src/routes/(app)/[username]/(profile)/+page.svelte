<script>
	import { Balance, Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, subject, user } = data;
	let v;
</script>

<div class="flex justify-center lg:justify-start">
	{#if user?.id === subject.id}
		<Balance {user} />
	{/if}
</div>
