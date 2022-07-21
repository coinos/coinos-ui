<script>
	import { scroll } from '../lib/utils';
	import { PrimaryButton, SecondaryButton } from '../components';

	export let howItWorks;
	export let faq;
</script>

<header class="w-full lg:w-5/6 pt-10 mx-auto">
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<a href="/">
			<img src="/icons/logo.svg" alt="logo" class="mx-auto mb-5 xl:mb-0" />
		</a>
		<div class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold">
			<button on:click={() => scroll(howItWorks)}>How It Works</button>
			<button on:click={() => scroll(faq)}>FAQ</button>
			<button>About</button>
			<SecondaryButton title="Start in Seconds" />
			<PrimaryButton title="Login" />
		</div>
	</nav>
</header>
