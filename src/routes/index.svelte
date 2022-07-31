<script>
	import {
		LandingHeader,
		LandingHero,
		LandingInfoCard,
		HowItWorksCard,
		FaqCard,
		Image,
		About
	} from '$comp';

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

<LandingHeader {howItWorks} {faq} {about} />

<main class="space-y-40 py-20 md:py-32 lg:py-40 px-5 md:px-0">
	<!-- hero -->
	<LandingHero />

	<!-- landing info 1 -->
	<LandingInfoCard
		image="lightning-qr"
		title="Instant payments via Lightning."
		description="The moment your customer sends a payment, it’s there. No waiting for bank settlements or
    worrying about chargebacks. Instant settlement, in seconds. Say goodbye to 3% credit card
    processing fees."
	/>

	<!-- landing info 2 -->
	<LandingInfoCard
		image="phone-checkout"
		title="Simple to use, custodial by default."
		order="reverse"
	>
		Just enter an amount, share QR code and you’re done.
		<br /><br />
		CoinOS is custodial by default, which eliminates the need to understand how bitcoin/lightning works.
		We do all the heavy lifting so you can focus on your business.
		<br /><br />
		You always have the option of
		<span class="underline underline-offset-4">taking custody</span> of your own keys.
	</LandingInfoCard>

	<!-- landing info 3 -->
	<LandingInfoCard
		image="customize"
		title="Brand it your way!"
		description="Customize your point of sale look and feel, or keep it on default - totally up to you."
	/>

	<!-- how it works -->
	<div bind:this={howItWorks}>
		<h3 class="text-5xl font-medium mb-10 text-center">How it works</h3>
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

	<!-- about -->
	<div bind:this={about}>
		<About />
	</div>
</main>
