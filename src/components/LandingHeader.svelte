<script>
	import { goto } from '$app/navigation';
	import { scroll } from '$lib/utils';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { page } from '$app/stores';

	export let howItWorks;
	export let faq;
	export let about;
	export let user;

	let showMobileMenu = false;
	let header;
	const mobileMenuButtonClick = (section) => {
		showMobileMenu = false;
		scroll(section);
	};
</script>

<header
	class="w-full lg:px-40 py-5 mx-auto fixed md:sticky z-10 top-0 bg-white/90"
	bind:this={header}
>
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<div class="flex justify-start md:justify-center items-center md:space-x-10">
			<a href="/" on:click={() => scroll(header)}>
				<Icon icon="logo" style="hidden md:block mb-5 xl:mb-0 w-32" />
				<Icon icon="logo" style="block md:hidden ml-5 w-48" />
			</a>
		</div>

		<!-- desktop nav -->
		<div class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold">
			{#if $page.url.pathname === '/'}
				<button class="hover:opacity-80" on:click={() => scroll(howItWorks)}
					>{$t('howItWorks.header')}</button
				>
				<button class="hover:opacity-80" on:click={() => scroll(faq)}>{$t('faq.header')}</button>
				<button class="hover:opacity-80" on:click={() => scroll(about)}>{$t('about.header')}</button
				>
			{/if}
			{#if user}
				<button
					class="border rounded-full px-6 py-2 font-bold"
					on:click={() => goto(`/${user.username}`)}
					>Home
				</button>
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold"
					on:click={() => goto('/logout')}
				>
					{$t('nav.signOut')}
				</button>
			{:else}
				<button
					class="border rounded-full px-6 py-2 font-bold hover:opacity-80"
					on:click={() => goto('/register')}
					>{$t('nav.startInSeconds')}
				</button>
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold hover:opacity-80"
					on:click={() => goto('/login')}
				>
					{$t('nav.signIn')}
				</button>
			{/if}
		</div>

		<!-- mobile nav -->
		<button
			class="block md:hidden absolute top-[34.5px] right-10 z"
			on:click={() => (showMobileMenu = !showMobileMenu)}
			><Icon icon={!showMobileMenu ? 'menu' : 'close'} />
		</button>

		<div
			class="container w-full px-10 md:hidden absolute top-0 {showMobileMenu
				? 'right-0'
				: 'right-[-100%]'} transition-all ease-in-out duration-300 h-[100vh] w-full bg-white"
		>
			<div class="space-y-8 mt-24 font-bold text-xl">
				<button on:click={() => mobileMenuButtonClick(howItWorks)} class="block"
					>{$t('howItWorks.header')}</button
				>
				<button on:click={() => mobileMenuButtonClick(faq)} class="block">{$t('faq.header')}</button
				>
				<button on:click={() => mobileMenuButtonClick(about)} class="block"
					>{$t('about.header')}</button
				>
				{#if !user}
					<button
						class="border rounded-full px-6 py-2 font-bold block w-full"
						on:click={() => goto('/register')}
						>{$t('nav.startInSeconds')}
					</button>
					<button
						class="bg-black text-white border rounded-full px-6 py-2 font-bold block w-full"
						on:click={() => goto('/login')}
					>
						{$t('nav.signIn')}
					</button>
				{:else}
					<button
						class="border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto(`/${user.username}`)}
						>{$t('nav.account')}
					</button>
					<button
						class="bg-black text-white border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto('/logout')}
					>
						{$t('nav.signOut')}
					</button>
				{/if}
			</div>
		</div>
	</nav>
</header>

<style>
	.z {
		z-index: 100;
	}
</style>
