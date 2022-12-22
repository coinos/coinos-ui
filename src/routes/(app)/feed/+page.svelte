<script>
	import { Feed } from '$comp';
	import { events } from '$lib/store';

	export let data;
	let { user } = data;

	$: sorted = Object.values($events)
		.filter((ev) => ev?.pubkey)
		.sort((a, b) => b.seen - a.seen);
</script>

<div class="mb-20">
	<div class="container w-full mx-auto text-lg px-4 md:max-w-2xl space-y-5">
		<Feed events={sorted} />
	</div>
</div>
