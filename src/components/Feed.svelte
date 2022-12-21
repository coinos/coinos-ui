<script>
	import { Avatar } from '$comp';
	import { browser } from '$app/environment';
	import VirtualScroll from 'svelte-virtual-scroll-list';
	import { runner } from '$lib/utils';
	export let events;

	let distance = (d) => {
		let diff = Math.round(Date.now() / 1000) - d;
		return diff > 3600
			? Math.round(diff / 3600) + 'd'
			: diff > 60
			? Math.round(diff / 60) + 'm'
			: diff > 2
			? diff + 's'
			: 'now';
	};

	let w;
</script>

<svelte:window bind:innerWidth={w} />

{#if browser}
	<VirtualScroll data={events} key="id" let:data pageMode={true} estimateSize={200}>
		<div class="flex border-b py-4 text-sm lg:text-lg text-secondary" :key={data.id}>
			<a href={`/${data.pubkey}`}>
				<div class="mb-auto mr-2">
					<div class="md:hidden">
						<Avatar size={12} src={`/api/public/runners/${runner(data.pubkey)}`} disabled={true} />
					</div>
					<div class="hidden md:block">
						<Avatar size={20} src={`/api/public/runners/${runner(data.pubkey)}`} disabled={true} />
					</div>
				</div>
			</a>

			<div class="grow" style={`max-width: ${w - 100}px`}>
				<div class="w-full flex pb-1 text-black">
					<div>{data.pubkey.substr(0, 6)}</div>
					<div class="text-secondary">&nbsp;{distance(data.seen)}</div>
				</div>
				<div class="break-words">
					{data.content}
				</div>
			</div>
		</div>
	</VirtualScroll>
{/if}
