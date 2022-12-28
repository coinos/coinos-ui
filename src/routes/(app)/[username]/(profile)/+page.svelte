<script>
	import { Feed } from '$comp';
	import { t } from '$lib/translations';

	export let data;
	let { events, user } = data;
</script>

{#if events.length}
	<Feed {events} {user} />
{:else}
	<div class="text-center text-2xl mt-20">
		Nothing here yet. Post your first <a
			href="https://github.com/nostr-protocol/nostr#nostr---notes-and-other-stuff-transmitted-by-relays"
			class="underline">nostr</a
		> note!
	</div>
{/if}
