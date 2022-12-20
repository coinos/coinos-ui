<script>
	import { fade } from 'svelte/transition';
	import { Avatar, Icon } from '$comp';
	import { format, parseISO } from 'date-fns';
	import { t } from '$lib/translations';
	import { events } from '$lib/store';
	import VirtualScroll from 'svelte-virtual-scroll-list';
	import { browser } from '$app/environment';
	import runners from '$lib/runners';

	export let data;
	let { user } = data;
	let runner = () => runners[Math.floor(Math.random() * runners.length)];

	$: length = $events?.q?.length;
	$: sorted = Object.values($events)
		.filter((ev) => ev?.pubkey)
		.sort((a, b) => b.seen - a.seen);
</script>

<div class="mt-24 mb-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">Nostr</h1>

	<div class="container w-full mx-auto text-lg px-4 max-w-2xl space-y-5">
		<div class="vs">
			{#if browser}
				<VirtualScroll data={sorted} key="id" let:data pageMode={true}>
					<div class="grid grid-cols-3 border-b pb-5" :key={data.id} use:fade>
						<div class="my-auto text-secondary">
							<div class="flex">
								<div class="my-auto">
									<Avatar size={20} src={`/api/public/runners/${runner()}`} />
								</div>
								<div class="my-auto ml-1">
									{data.pubkey.substr(0, 6)}<br />
									<span class="text-sm">{format(new Date(data.seen * 1000), 'h:mm aaa')}</span>
								</div>
							</div>
						</div>

						<div class="my-auto col-span-2">
							<div class="text-secondary break-words">{data.content}</div>
						</div>
					</div>
				</VirtualScroll>
			{/if}
		</div>
	</div>
</div>
