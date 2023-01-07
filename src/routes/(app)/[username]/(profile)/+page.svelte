<script>
	import { Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, subject, user } = data;
</script>

<!-- <div class="font-bold flex justify-around items-center border-b pb-3 text-secondary mt-20"> -->
<!-- 	<a href={`/${user.username}`}> -->
<!-- 		<button class="hover:opacity-80 uppercase" class:text-black={true}> -->
<!-- 			{$t(`user.notes`)} -->
<!-- 		</button> -->
<!-- 	</a> -->
<!-- 	<a href={`/${user.username}`}> -->
<!-- 		<button class="hover:opacity-80 uppercase"> -->
<!-- 			{$t(`user.feed`)} -->
<!-- 		</button> -->
<!-- 	</a> -->
<!-- 	<a href={`/${user.username}`}> -->
<!-- 		<button class="hover:opacity-80 uppercase"> -->
<!-- 			{$t(`user.messages`)} -->
<!-- 		</button> -->
<!-- 	</a> -->
<!-- </div> -->

<div class="mt-20">
	<Feed {events} user={subject?.username === user?.username && user} />
</div>
