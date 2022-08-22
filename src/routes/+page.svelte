<script>
	import {
		LandingHeader,
		LandingHero,
		LandingInfoCard,
		HowItWorksCard,
		FaqCard,
		Image,
		About,
		Footer
	} from '$comp';

	import { _ } from 'svelte-i18n';

	let howItWorks;
	let faq;
	let about;

	const howItWorksSteps = [
		{ image: 'hand', stepID: 'step1' },
		{ image: 'bolt', stepID: 'step2' },
		{ image: 'smile', stepID: 'step3' }
	];

	const faqIDs = ['cost', 'compatibility', 'safety'];
</script>

<LandingHeader {howItWorks} {faq} {about} />

<main class="space-y-40 py-20 md:py-32 lg:py-36 xl:py-40 px-5 md:px-0">
	<!-- hero -->
	<LandingHero />

	<!-- landing info 1 -->
	<LandingInfoCard
		image="lightning-qr"
		title={$_('landing.info1.title')}
		description={$_('landing.info1.description')}
	/>

	<!-- landing info 2 -->
	<LandingInfoCard image="phone-checkout" title={$_('landing.info2.title')} order="reverse">
		{$_('landing.info2.description1')}
		<br /><br />
		{$_('landing.info2.description2')}
		<br /><br />
		{@html $_('landing.info2.description3')}
	</LandingInfoCard>

	<!-- landing info 3 -->
	<div>
		<LandingInfoCard
			image="customize"
			title={$_('landing.info3.title')}
			description={$_('landing.info3.description')}
		/>
		<div bind:this={howItWorks} />
	</div>

	<!-- how it works -->
	<div>
		<h3 class="text-5xl font-medium mb-10 text-center">{$_('howItWorks.header')}</h3>
		<div
			class="block lg:flex justify-center items-center space-y-10 lg:space-y-0 lg:space-x-10 text-center"
		>
			{#each howItWorksSteps as step}
				<HowItWorksCard image={step.image} stepID={step.stepID} />
			{/each}
		</div>
		<div bind:this={faq} />
	</div>

	<!-- faq -->
	<div>
		<div class="space-y-10">
			<h3 class="text-5xl font-medium text-center">{$_('faq.header')}</h3>
			{#each faqIDs as faqID}
				<FaqCard questionID={faqID} />
			{/each}
		</div>
		<div bind:this={about} />
	</div>

	<!-- about -->
	<div>
		<About />
	</div>
</main>

<Footer />
