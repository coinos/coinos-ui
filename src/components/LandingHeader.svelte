<script>
	import { goto } from '$app/navigation';
	import { scroll } from '../lib/utils';
	import { PrimaryButton, SecondaryButton, Icon } from '$comp';

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
			<SecondaryButton title="Start in Seconds" click={() => goto('/register')} />
			<PrimaryButton title="Sign In" click={() => goto('/login')} />
		</div>
	</nav>
</header>
