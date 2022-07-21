<script>
	import { scroll } from '../lib/utils';
	import { HowItWorksCard, FaqCard } from '../components';

	let howItWorks;
	let faq;
	let about;

	const howItWorksSteps = [
		{
			image: 'hand',
			step: '1. Create your account',
			description: 'A username & password is all you need to get started.'
		},
		{
			image: 'bolt',
			step: '2. Ask for payments',
			description: 'The same as you normally would, but with Bitcoin.'
		},
		{
			image: 'smile',
			step: "3. That's all!",
			description: 'You can convert to local currency at any point.'
		}
	];

	const faqQuestions = [
		{
			question: 'What does it cost?',
			answer:
				'CoinOS is free to use. You only pay a 1% fee if/when you withdraw your funds. Compare this to 3% typically charged by a credit card processor.'
		},
		{
			question: 'Do I need any special device or software?',
			answer:
				'No. CoinOS is web-based, so as long as you have an internet connection, you can use it on any device or hardware. Most merchants might use it on a phone or a tablet.'
		},
		{
			question: 'Are my funds safe?',
			answer:
				'Your funds are stored on our secure server, however we recommend that you withdraw them to your own cold storage for long-term savings.'
		}
	];
</script>

<header class="w-full lg:w-5/6 pt-10 mx-auto">
	<nav class="block lg:flex flex-wrap justify-between items-center">
		<a href="/">
			<img src="/icons/logo.svg" alt="logo" class="mx-auto mb-5 lg:mb-0" />
		</a>
		<div class="hidden space-x-10 font-medium md:flex flex-wrap justify-center items-center">
			<button on:click={() => scroll(howItWorks)}>How It Works</button>
			<button on:click={() => scroll(faq)}>FAQ</button>
			<button>About</button>
			<button class="border rounded-full px-3 py-1">Start in Seconds</button>
			<button class="bg-black text-white border rounded-full px-3 py-1">Login</button>
		</div>
	</nav>
</header>

<main class="space-y-40 py-20 md:py-40 px-5 md:px-0">
	<!-- hero -->
	<div>
		<div class="space-y-10">
			<h1
				class="text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-medium text-center w-full md:w-3/4 lg:w-1/2 max-w-7xl mx-auto leading-tight"
			>
				The <span class="relative"
					>easiest<img
						src="/icons/rays.svg"
						alt="rays"
						class="absolute -top-16 left-5 md:left-8 lg:left-14 2xl:left-24"
					/></span
				> way to accept Bitcoin in your store.
			</h1>
			<h2
				class="text-center text-secondary w-full md:w-3/5 lg:w-2/5 max-w-3xl mx-auto text-xl leading-normal font-medium"
			>
				Grow your customer base and revenue by accepting Bitcoin with an easy-to-use and managed
				Point of Sale. No software or hardware required.
			</h2>
			<div class="flex justify-center">
				<button class="bg-black text-white border rounded-full px-3 py-1 font-medium"
					>Start in Seconds</button
				>
			</div>
		</div>

		<div
			class="bg-gradient-to-br from-[#F5F7FA] via-[#EAF2FF] to-[#DEDFFF] rounded-full w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px] 2xl:w-[650px] 2xl:h-[650px] mx-auto mt-20 flex justify-center items-center"
		>
			<img src="/images/hero-image.svg" alt="tablet-pos" />
		</div>
	</div>

	<!-- landing info 1 -->
	<div class="block lg:flex justify-center lg:space-x-20 items-center">
		<div
			class="bg-gradient-to-r from-[#FFF9FF] via-[#F7FBFE] to-[#ECEFFF] rounded-full w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[450px] xl:h-[450px] 2xl:w-[500px] 2xl:h-[500px] flex justify-center items-center mx-auto lg:mx-0 mb-10 lg:mb-0"
		>
			<img src="/images/lightning-qr.svg" alt="lightning-qr" class="w-5/6" />
		</div>
		<div class="w-full lg:w-1/2 max-w-3xl space-y-10 mx-auto lg:mx-0">
			<h3 class="text-5xl font-medium text-left">Instant payments via Lightning.</h3>
			<p class="text-secondary text-xl font-medium w-full lg:w-3/4 mx-auto lg:mx-0">
				The moment your customer sends a payment, it’s there. No waiting for bank settlements or
				worrying about chargebacks. Instant settlement, in seconds. Say goodbye to 3% credit card
				processing fees.
			</p>
		</div>
	</div>

	<!-- landing info 2 -->
	<div class="block lg:flex justify-center lg:space-x-20 items-center">
		<div
			class="md:order-last bg-gradient-to-r from-[#F5F7FA] via-[#EAF2FF] to-[#DEDFFF] rounded-full w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[450px] xl:h-[450px] 2xl:w-[500px] 2xl:h-[500px] flex justify-center items-center mx-auto lg:mx-0 mb-10 lg:mb-0"
		>
			<img src="/images/phone-checkout.svg" alt="phone-checkout" class="w-5/6" />
		</div>
		<div class="w-full lg:w-1/2 max-w-3xl space-y-10 mx-auto lg:mx-0">
			<h3 class="text-5xl font-medium text-left">Simple to use, custodial by default.</h3>
			<p class="text-secondary text-xl font-medium w-full lg:w-3/4 mx-auto lg:mx-0">
				Just enter an amount, share QR code and you’re done.
				<br /><br />
				CoinOS is custodial by default, which eliminates the need to understand how bitcoin/lightning
				works. We do all the heavy lifting so you can focus on your business.
				<br /><br />
				You always have the option of
				<span class="underline underline-offset-4">taking custody</span> of your own keys.
			</p>
		</div>
	</div>

	<!-- landing info 3 -->
	<div class="block lg:flex justify-center lg:space-x-20 items-center">
		<div
			class="bg-gradient-to-r from-[#FFF9FF] via-[#F7FBFE] to-[#ECEFFF] rounded-full w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[450px] xl:h-[450px] 2xl:w-[500px] 2xl:h-[500px] flex justify-center items-center mx-auto lg:mx-0 mb-10 lg:mb-0"
		/>
		<div class="w-full lg:w-1/2 max-w-3xl space-y-10 mx-auto lg:mx-0">
			<h3 class="text-5xl font-medium text-left">Brand it your way!</h3>
			<p class="text-secondary text-xl font-medium w-full lg:w-3/4 mx-auto lg:mx-0">
				Customize your point of sale look and feel, or keep it on default - totally up to you.
			</p>
		</div>
	</div>

	<!-- how it works -->
	<div bind:this={howItWorks}>
		<h3 class="text-5xl font-medium mb-20 text-center">How it works</h3>
		<div
			class="block lg:flex justify-center items-center space-y-10 lg:space-y-0 lg:space-x-10 text-center"
		>
			{#each howItWorksSteps as step}
				<HowItWorksCard image={step.image} step={step.step} description={step.description} />
			{/each}
		</div>
	</div>

	<!-- faq -->
	<div class="space-y-10" bind:this={faq}>
		<h3 class="text-5xl font-medium text-center">FAQ</h3>
		{#each faqQuestions as question}
			<FaqCard question={question.question} answer={question.answer} />
		{/each}
	</div>
</main>
