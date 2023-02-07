<script>
	import OutClick from 'svelte-outclick';
	import { banner, newPayment, colorTheme } from '$lib/store';
	import { goto } from '$app/navigation';
	import { Avatar, Icon } from '$comp';
	import { t } from '$lib/translations';
	import { page } from '$app/stores';

	export let data;

	let { subject, user } = data;
	$: update(data);
	let update = (data) => ({ subject, user } = data);

	let menuButtons;
	if (user)
		menuButtons = [
			{ key: 'nav.profile', icon: 'profile', href: `/${user.username}` },
			{ key: 'nav.settings', icon: 'settings', href: `/${user.username}/settings` },
			{ key: 'nav.support', icon: 'support', href: `/support` },
			{ key: 'nav.signOut', icon: 'logout', href: `/logout` }
		];

	let showMenu = false;

	$: bg =
		$banner?.id && $banner.id === subject.id
			? `url(${$banner.src})`
			: subject?.banner
			? `url(/api/public/${subject.id}-banner.webp)`
			: undefined;

	$: $page && (showMenu = false);
</script>

<header
	class="bg-gradient-to-r {$colorTheme} h-[175px] w-full relative bg-cover mb-20"
	style:background-image={bg}
>
	<nav class="flex justify-end items-center space-x-4 p-5">
		{#if user}
			<a href={`/${user.username}/dashboard`}>
				<button
					class="bg-white p-2 rounded-full w-12 h-12 md:w-16 md:h-16 drop-shadow-xl border border-black/10 {$page
						.url.pathname === `/${user.username}/dashboard`
						? 'opacity-100'
						: 'opacity-70 hover:opacity-80'}"
					><Icon icon="home" style="mx-auto w-6 md:w-8" />
				</button>
			</a>
			<a href={`/${user.username}/receive`}>
				<button
					class="bg-white p-2 rounded-full w-12 h-12 md:w-16 md:h-16 drop-shadow-xl border border-black/10 {$page
						.url.pathname === `/${user.username}/receive`
						? 'opacity-100'
						: 'opacity-70 hover:opacity-80'}"
					><Icon icon="numpad" style="mx-auto w-6 md:w-8" />
				</button>
			</a>
			<a href={`/${user.username}/payments`}>
				<button
					class="bg-white p-2 rounded-full w-12 h-12 md:w-16 md:h-16 drop-shadow-xl border border-black/10 {$page
						.url.pathname === `/${user.username}/payments`
						? 'opacity-100'
						: 'opacity-70 hover:opacity-80'} relative"
					><Icon icon="clock" style="mx-auto w-6 md:w-8" />
					{#if $newPayment}
						<span class="absolute top-0 right-0">
							<span class="flex h-3 w-3">
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"
								/>
								<span class="relative inline-flex rounded-full h-3 w-3 bg-[#F7931A]" />
							</span>
						</span>
					{/if}
				</button>
			</a>
			<a href={`/send`}>
				<button
					class="bg-white p-2 rounded-full w-12 h-12 md:w-16 md:h-16 drop-shadow-xl border border-black/10 {$page
						.url.pathname === `/send`
						? 'opacity-100'
						: 'opacity-70 hover:opacity-80'}"
					><Icon icon="send" style="mx-auto w-6 md:w-8" />
				</button>
			</a>
			<div class="relative">
				<OutClick on:outclick={() => (showMenu = false)}>
					<button
						class="bg-white p-2 rounded-full w-12 h-12 md:w-16 md:h-16 drop-shadow-xl border border-black/10 {$page
							.url.pathname === `/${user.username}` ||
						$page.url.pathname === `/${user.username}/settings` ||
						$page.url.pathname === `/support`
							? 'opacity-100'
							: `opacity-70 hover:opacity-80 ${showMenu ? 'opacity-80' : ''}`}"
						on:click={() => (showMenu = !showMenu)}
						><Icon icon="menu" style="mx-auto w-6 md:w-8" />
					</button>

					<div
						class="{showMenu
							? 'block'
							: 'hidden'} absolute top-14 right-0 bg-white rounded-3xl p-8 shadow-xl z"
					>
						<ul class="space-y-5 w-48">
							{#each menuButtons as { href, icon, key }}
								<li>
									<a {href} data-sveltekit-prefetch="off">
										<button class="flex justify-center items-center font-semibold hover:opacity-80"
											><Icon {icon} style="mr-2 w-6 md:w-8" /> {$t(key)}
										</button>
									</a>
								</li>
							{/each}
						</ul>
						<hr class="my-4" />
						<a href="/"><img src="/images/logo.svg" alt="Coinos" class="w-32" /></a>
					</div>
				</OutClick>
			</div>
		{:else}
			<a href="/login">
				<button class="bg-white px-5 py-2 rounded-xl font-semibold text-sm"
					>{$t('nav.signIn')}</button
				>
			</a>
		{/if}
	</nav>
	<div
		class="absolute md:w-[64px] md:mx-auto lg:left-[138px] left-[calc(50vw-64px)] -bottom-[64px] z-30"
	>
		<Avatar user={subject} />
	</div>
</header>

<style>
	.z {
		z-index: 100;
	}
</style>
