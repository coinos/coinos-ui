<script>
	import {
		Icon,
		LandingHeader,
		LandingHero,
		LandingInfoCard,
		HowItWorksCard,
		FaqCard,
		Image,
		About,
		Footer,
		Qr as Q
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

	let username = 'sample';
	let password = 'password';

	let src = Qr.drawImg(`https://coinos.io/${username}`, { size: 3200 });
</script>

<svelte:head>
	<script src="https://stamen-maps.a.ssl.fastly.net/js/tile.stamen.js"></script>
</svelte:head>

<LandingHeader {howItWorks} {faq} {about} {user} />

<main class="space-y-40 py-20 md:py-32 lg:py-36 xl:py-40 px-5 md:px-0">
	<div class="border-8 border-black p-12 w-[1050px] h-[600px] mx-auto text-4xl">
		<div class="flex w-full justify-center gap-4">
			<img src="/images/logo.svg" class="w-3/5" />
		</div>

		<div class="mt-14 flex">
			<div class="w-2/5 my-auto space-y-6">
				<p class="font-semibold">Adam Soltys</p>
        <p>Founder &amp; CTO</p>
				<p>604-358-6745</p>
				<p>adam@coinos.io</p>
			</div>
			<div class="text-center space-y-5">
				<p class="text-3xl">Accept Bitcoin payments for free</p>
				<p class="text-6xl">Start in seconds at <b>coinos.io</b></p>
				<p class="text-3xl">Based in North Vancouver</p>
			</div>
		</div>
	</div>
	<div class="border-8 border-black p-12 w-[1050px] h-[600px] mx-auto text-4xl">
		<h1 class="text-4xl font-medium text-center mx-auto leading-tight mt-16">
			{$t('landing.header_before_icon')}
			<span class="relative">
				{$t('landing.header_with_icon')}
				<Icon icon="rays" style="absolute -top-16 left-5 md:left-8 lg:left-14 2xl:left-24" />
			</span>
			way to get started with Bitcoin
		</h1>

		<div class="mt-8 flex text-xl gap-12">
			<ul class="space-y-2">
				<li>100% free! No account or transaction fees</li>
				<li>Connect to an amazing community looking for new places to spend Bitcoin</li>
				<li>We'll list you on our map and several directories</li>
				<li>We host weekly events and workshops</li>
				<li>We'll promote you locally and on social media and bring you good reviews</li>
			</ul>
			<ul class="space-y-2">
				<li>Registration takes seconds</li>
				<li>No personal information required</li>
				<li>Customize your branding in the app and get a personalized payment page</li>
				<li>Receive a complimentary receipt printer, QR code and window sticker</li>
				<li>We offer free 24/7 support</li>
			</ul>
		</div>

		<div class="flex mt-8 w-full">
			<img src="/images/logo.svg" class="my-auto" />
			<div class="mx-auto mt-5 text-right flex-grow">Start in seconds at <b>coinos.io</b></div>
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
