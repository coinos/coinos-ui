<script>
	import {
		LandingHeader,
		LandingHero,
		LandingInfoCard,
		HowItWorksCard,
		FaqCard,
		Image,
		About,
		Footer,
      Qr as Q,
	} from '$comp';

  import Qr from 'qrcode-base64';

	import { t } from '$lib/translations';
	import { close } from '$lib/socket';
	import { onMount } from 'svelte';

	export let data;
	let { user } = data;
	let { locations } = data;

	let howItWorks;
	let faq;
	let about;

	const howItWorksSteps = [
		{ image: 'hand', stepID: 'step1' },
		{ image: 'bolt', stepID: 'step2' },
		{ image: 'smile', stepID: 'step3' }
	];

	const faqIDs = ['cost', 'compatibility', 'safety'];

	onMount(async () => {
		close();

		try {
			({ locations } = await fetch('/locations').then((r) => r.json()));
		} catch (e) {
			console.log(e);
		}
	});

	let src = Qr.drawImg("https%3A%2F%2Fcoinos.io%2FLaughingBean", { size: 600 });
</script>

<svelte:head>
	<script src="https://stamen-maps.a.ssl.fastly.net/js/tile.stamen.js"></script>
</svelte:head>

<LandingHeader {howItWorks} {faq} {about} {user} />

<main class="space-y-40 py-20 md:py-32 lg:py-36 xl:py-40 px-5 md:px-0">
<div class="space-y-8">
	<div class="flex w-full justify-center gap-4">
		<img src="/images/bitcoin.png" class="w-14" />
		<h3 class="text-5xl font-medium text-center">Pay with Bitcoin</h3>
	</div>
    <Q  {src} />
    <div class="text-center text-3xl">https://coinos.io/LaughingBean</div>
    <div class="text-center text-3xl">Don't have a wallet?<br> Sign up for free at <b>coinos.io</b>!</div>
    <div class="justify-center w-full flex">
    <img src="/images/logo.svg" />
    </div>
    </div>
	<LandingHero {user} />
	<LandingInfoCard
		image="lightning-qr"
		title={$t('landing.info1.title')}
		description={$t('landing.info1.description')}
	/>

	<LandingInfoCard image="phone-checkout" title={$t('landing.info2.title')} order="reverse">
		{$t('landing.info2.description1')}
		<br /><br />
		{$t('landing.info2.description2')}
		<br /><br />
		{@html $t('landing.info2.description3')}
	</LandingInfoCard>

	<div>
		<LandingInfoCard
			image="customize"
			title={$t('landing.info3.title')}
			description={$t('landing.info3.description')}
		/>
		<div bind:this={howItWorks} />
		<div id="about" />
	</div>

	<div>
		<h3 class="text-5xl font-medium mb-10 text-center">{$t('howItWorks.header')}</h3>
		<div class="grid lg:grid-cols-3 space-y-10 lg:space-y-0 text-center">
			{#each howItWorksSteps as step}
				<HowItWorksCard image={step.image} stepID={step.stepID} />
			{/each}
		</div>
		<div bind:this={faq} />
	</div>

	<div>
		<div class="space-y-10">
			<h3 class="text-5xl font-medium text-center">{$t('faq.header')}</h3>
			{#each faqIDs as faqID}
				<FaqCard questionID={faqID} />
			{/each}
		</div>
		<div bind:this={about} />
	</div>

	<About {locations} />
</main>

<Footer />
