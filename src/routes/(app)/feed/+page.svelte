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
	<div class="container w-full mx-auto text-lg px-4 md:max-w-2xl space-y-5">
		<div class="vs">
			{#if browser}
				<VirtualScroll data={sorted} key="id" let:data pageMode={true}>
					<div class="flex border-b py-4" :key={data.id} use:fade>
						<div class="mb-auto mr-2">
							<div class="md:hidden">
								<Avatar size={12} src={`/api/public/runners/${runner()}`} />
							</div>
							<div class="hidden md:block">
								<Avatar size={20} src={`/api/public/runners/${runner()}`} />
							</div>
						</div>

						<div class="text-secondary break-words w-full">
							<div class="w-full flex text-sm pb-1">
								<div class="text-black">{data.pubkey.substr(0, 6)}</div>
								<div class="ml-auto text-sm">{format(new Date(data.seen * 1000), 'h:mm aaa')}</div>
							</div>
							{data.content}
						</div>
					</div>
				</VirtualScroll>
			{/if}
		</div>
	</div>
</div>
