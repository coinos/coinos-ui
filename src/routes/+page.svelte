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

  let username = 'eotl';
  let password = 'general123';

  let src = Qr.drawImg(`https://coinos.io/${username}`, { size: 3200 });
</script>

<svelte:head>
	<script src="https://stamen-maps.a.ssl.fastly.net/js/tile.stamen.js"></script>
</svelte:head>

<LandingHeader {howItWorks} {faq} {about} {user} />

<main class="space-y-40 py-20 md:py-32 lg:py-36 xl:py-40 px-5 md:px-0">
	<div class="space-y-5 border-8 border-black p-8 w-[800px] mx-auto">
		<div class="flex w-full justify-center gap-4">
			<img src="/images/bitcoin.png" class="w-14" />
			<h3 class="text-5xl font-medium text-center">Bitcoin Instructions</h3>
		</div>
		<div>
			<p class="text-center text-lg">Public Payment Page</p>
      <div class="flex justify-center text-2xl"><b>https://coinos.io/{username}</b></div>
		</div>
		<div>
			<p class="text-center text-lg">Staff Login</p>
      <div class="flex justify-center text-2xl"><b>{username} / {password}</b></div>
		</div>
    <div class="py-8">
		<p class="text-lg font-semibold">What to do if a customer asks to pay with Bitcoin</p>
		<ol class="list-decimal ml-4">
			<li class="pt-2">Direct the customer to scan the QR code at the counter to visit the payment page above.</li>
			<li class="pt-2">Enter the sale into your existing PoS as if it were paid by cash.</li>
			<li class="pt-2">Tell the customer their total with tax or let them read it off the till.</li>
			<li class="pt-2">Check the merchant receipt that comes out of the printer to ensure the total is correct.</li>
			<li class="pt-2">Hand the customer their items and a cash receipt from your PoS if requested.</li>
		</ol>
    </div>

		<p>
    At cash out you can view all received payments at <b>https://coinos.io/{username}/payments</b> or simply total up the amounts from all the merchant receipts.
		</p>

		<p>
    If you have any questions please email <b>support@coinos.io</b> or call Adam at <b>604-358-6745</b>
		</p>

		<img src="/images/logo.png" class="ml-auto" style="width: 120px" />
	</div>
	<div class="space-y-8 border-8 border-black p-8 w-[680px] mx-auto">
		<div class="flex w-full justify-center gap-4">
			<img src="/images/bitcoin.png" class="w-14" />
			<h3 class="text-5xl font-medium text-center">Pay with Bitcoin</h3>
			<div class="text-5xl">⚡️</div>
		</div>
		<Q {src} />
    <div class="text-center text-4xl">https://coinos.io/{username}</div>
		<div>
			<div class="text-center text-xl pt-2">
				1. Use your <b>Camera</b> app to <b>open this URL in a browser</b>
			</div>
			<div class="text-center text-xl pt-2">2. Click <b>Pay</b> to enter your bill total</div>
      <div class="text-center text-xl pt-2">3. Pay with your favourite <b>Bitcoin Lightning</b> wallet app</div>
		</div>
		<img src="/images/logo.png" class="ml-auto" style="width: 120px" />
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
