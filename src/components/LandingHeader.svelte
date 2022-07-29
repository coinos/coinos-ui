<script>
	import { goto } from '$app/navigation';
	import { scroll } from '$lib/utils';
	import { Icon } from '$comp';

  import { _, locale, locales } from 'svelte-i18n';

	export let howItWorks;
	export let faq;
</script>

<header class="w-full lg:w-5/6 pt-10 mx-auto">
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<a href="/">
			<Icon icon="logo" style="mx-auto mb-5 xl:mb-0" />
		</a>

    <select bind:value={$locale}>
      {#each $locales as locale}
        <option value={locale}>{locale}</option>
      {/each}
    </select>

		<div class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold">
			<button on:click={() => scroll(howItWorks)}>{$_('howItWorks')}</button>
			<button on:click={() => scroll(faq)}>{$_('FAQ')}</button>
			<button>{$_('about')}</button>
			<button class="border rounded-full px-6 py-2 font-bold" on:click={() => goto('/register')}
				>{$_('startInSeconds')}</button
			>
			<button
				class="bg-black text-white border rounded-full px-6 py-2 font-bold"
				on:click={() => goto('/login')}
			>
        {$_('signIn')}
			</button>
		</div>
	</nav>
</header>
