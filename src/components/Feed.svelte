<script>
	import { Avatar } from '$comp';
	import { browser } from '$app/environment';
	import VirtualScroll from 'svelte-virtual-scroll-list';
	import { punk } from '$lib/utils';
	export let events;

	let distance = (date) => {
		let m = 60;
		let h = 60 * m;
		let d = 24 * h;

		let diff = Math.round(Date.now() / 1000) - date;
		return diff > d
			? Math.round(diff / d) + 'd'
			: diff > h
			? Math.round(diff / h) + 'h'
			: diff > m
			? Math.round(diff / m) + 'm'
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
			<a href={`/${data.user.anon ? data.user.pubkey : data.user.username}`}>
				<div class="mb-auto mr-2">
					<div class="md:hidden">
						<Avatar size={12} user={data.user} disabled={true} />
					</div>
					<div class="hidden md:block">
						<Avatar size={20} user={data.user} disabled={true} />
					</div>
				</div>
			</a>

			<div class="grow" style={`max-width: ${w - 100}px`}>
				<div class="w-full flex pb-1 text-black">
					<div>{data.user.username}</div>
					<div class="text-secondary">&nbsp;{distance(data.seen)}</div>
				</div>
				<div class="break-words">
					{data.content}
				</div>
			</div>
		</div>
	</VirtualScroll>
{/if}
