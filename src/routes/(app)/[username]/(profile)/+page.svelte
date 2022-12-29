<script>
	import { Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, subject, user } = data;
</script>

<Feed {events} user={subject.username === user.username && user} />
