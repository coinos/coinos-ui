<script>
	import { goto } from '$app/navigation';
	import { scroll } from '$lib/utils';
	import { Icon } from '$comp';
	import { user } from '$lib/store';

	export let howItWorks;
	export let faq;
</script>

<header class="w-full lg:w-5/6 pt-10 mx-auto">
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<a href="/">
			<Icon icon="logo" style="mx-auto mb-5 xl:mb-0" />
		</a>

		<div class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold">
			<button on:click={() => scroll(howItWorks)}>How It Works</button>
			<button on:click={() => scroll(faq)}>FAQ</button>
			<button>About</button>
			{#if !$user}
				<button class="border rounded-full px-6 py-2 font-bold" on:click={() => goto('/register')}
					>Start in Seconds</button
				>
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold"
					on:click={() => goto('/login')}
				>
					Sign in
				</button>
			{:else}
				<button
					class="bg-black text-white border rounded-full px-6 py-2 font-bold"
					on:click={() => goto('/logout')}
				>
					Sign out
				</button>
			{/if}
		</div>
	</nav>
</header>
