<script>
	import { t } from '$lib/translations';
	import { Avatar } from '$comp';
	import { browser } from '$app/environment';
	import VirtualScroll from 'svelte-virtual-scroll-list';

	export let data;
	let {
		subject: { followers }
	} = data;

	let w;
</script>

<svelte:window bind:innerWidth={w} />

<div class="px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-8">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
		{$t('user.followers')}
	</h1>

	{#if browser}
		{#if followers.length}
			<VirtualScroll data={followers} key="pubkey" let:data pageMode={true}>
				<a href={`/${data.pubkey}`}>
					<div
						class="flex border-b last:border-b-0 py-4 text-sm lg:text-lg text-secondary"
						:key={data.pubkey}
					>
						<div class="mb-auto mr-2">
							<div class="md:hidden">
								<Avatar size={12} user={data} disabled={true} />
							</div>
							<div class="hidden md:block">
								<Avatar size={20} user={data} disabled={true} />
							</div>
						</div>

						<div class="w-full flex pb-1 text-black my-auto">
							<div>
								{data.display_name || ''} <span class="text-secondary">@{data.username}</span>
							</div>
						</div>
					</div>
				</a>
			</VirtualScroll>
		{:else}
			<div>No followers</div>
		{/if}
	{/if}
</div>
