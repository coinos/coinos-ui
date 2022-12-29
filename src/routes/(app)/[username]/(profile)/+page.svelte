<script>
	import { Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, user } = data;
</script>

<Feed {events} {user} />
