<script>
	import { goto } from '$app/navigation';
	import { scroll } from '$lib/utils';
	import { Icon, LocaleSelector } from '$comp';
	import { user } from '$lib/store';
  import { _ } from 'svelte-i18n';

	export let howItWorks;
	export let faq;
	export let about;

	let showMobileMenu = false;
	const mobileMenuButtonClick = (section) => {
		showMobileMenu = false;
		scroll(section);
	};
</script>

<header class="w-full lg:w-5/6 py-5 mx-auto fixed md:sticky z-10 top-0 bg-white/90">
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<a href="/" class="hidden md:block">
			<Icon icon="logo" style="mx-auto mb-5 xl:mb-0" />
		</a>
		<Icon icon="logo" style="block md:hidden ml-5 w-48" />

		<!-- desktop nav -->
		<div class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold">
      <LocaleSelector />

			<button on:click={() => scroll(howItWorks)}>{$_('howItWorks')}</button>
			<button on:click={() => scroll(faq)}>{$_('FAQ')}</button>
			<button on:click={() => scroll(about)}>{$_('about')}</button>
			{#if !$user}
				<button class="border rounded-full px-6 py-2 font-bold" on:click={() => goto('/register')}
					>{$_('startInSeconds')}
				</button>
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold"
					on:click={() => goto('/login')}
				>
					{$_('signIn')}
				</button>
			{:else}
				<button
					class="border rounded-full px-6 py-2 font-bold"
					on:click={() => goto(`/${$user.username}/dashboard`)}
					>Account
				</button>
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold"
					on:click={() => goto('/logout')}
				>
					Sign out
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
			class="block md:hidden absolute top-0 {showMobileMenu
				? 'right-0'
				: 'right-[-100%]'} transition-all ease-in-out duration-300 h-[100vh] w-full bg-white"
		>
			<div class="space-y-8 mt-24 ml-10 font-bold text-xl">
        <LocaleSelector />

				<button on:click={() => mobileMenuButtonClick(howItWorks)} class="block"
					>{$_('howItWorks')}</button
				>
				<button on:click={() => mobileMenuButtonClick(faq)} class="block">{$_('FAQ')}</button>
				<button on:click={() => mobileMenuButtonClick(about)} class="block">{$_('about')}</button>
				{#if !$user}
					<button
						class="border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto('/register')}
						>{$_('signIn')}
					</button>
					<button
						class="bg-black text-white border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto('/login')}
					>
            {$_('startInSeconds')}
					</button>
				{:else}
					<button
						class="border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto(`/${$user.username}/dashboard`)}
						>Account
					</button>
					<button
						class="bg-black text-white border rounded-full px-6 py-2 font-bold block"
						on:click={() => goto('/logout')}
					>
						Sign out
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
