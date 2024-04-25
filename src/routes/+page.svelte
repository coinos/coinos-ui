<script>
	import { slide } from 'svelte/transition';
	import { gsap } from "gsap";
    import { enhance } from "$app/forms";
	import * as Accordion from "$lib/shadcn/components/ui/accordion";
	import * as Sheet from "$lib/shadcn/components/ui/sheet";
    import { Button } from "$lib/shadcn/components/ui/button";
	import { Separator } from "$lib/shadcn/components/ui/separator";
	import { page } from '$app/stores';
	import { t } from "$lib/translations";
	import { scroll } from '$lib/utils';
    import ThemeToggle from "../components/buttons/ThemeToggle.svelte";
    import Footer from "../components/Footer.svelte";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
	
	export let data;
	let about, faq, s
	let askedQuestionsAccordionValue = "item-0"

	let askedQuestionsAccordion = [
		{id: 0, title: "What does it cost?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."},
		{id: 1, title: "Do I need any special device or software?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."},
		{id: 2, title: "When do my funds settle?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."}
	]

	let themeSelected = data.colorThemeSelected;
	let toggleThemeForm;
	let homeNav;
	let homeNavActiveLeft = 32;
	let homeNavActiveTranslate = 102.46875;
	let NavHowItWorksEl;
	let showAlert = true;

	function toggleThemeSelected() {
		themeSelected = themeSelected === "light" ? "dark" : "light"; 
	}

	function submitUpdateTheme ({ action }) {
		const theme = action.searchParams.get('theme');
		const htmlClasses = document.documentElement.classList;
		if (theme == "dark" && !(htmlClasses.contains("dark"))) {
			htmlClasses.add("dark");
			htmlClasses.remove("light");
		} else if (theme == "light" && !(htmlClasses.contains("light"))) {
			htmlClasses.add("light");
			htmlClasses.remove("dark");
		}
		toggleThemeSelected()
	}

	function defineHomeNavActive(element) {
		homeNavActiveTranslate = element.getBoundingClientRect().width;
		homeNavActiveLeft = element.getBoundingClientRect().left - homeNav.getBoundingClientRect().left 
	}

	onMount(() => {
		if (NavHowItWorksEl) {
			defineHomeNavActive(NavHowItWorksEl)
		}
	})
	
</script>

<!-- aleart -->

{#if showAlert}
	<div
		class="relative bg-swapee-purple mb-0 flex gap-x-2 p-4 border-b-2 border-black"
		role="alert"
		transition:slide={{duration: 125}}
	>
		<p class="text-center mb-0 text-white fw-semibold w-full font-semibold">
		It's important not to forget your <span class="text-yellow">username</span> and
		<span class="text-yellow">password</span> since we don't have access to those details.
		</p>
		<button
			type="button"
			class="bg-transparent border-0 shadow-none"
			data-bs-dismiss="alert"
			aria-label="Close"
			on:click={() => showAlert = false}
		>
			<img src="images/cross-icon.png" alt="" />
		</button>
	</div>
{/if}

<!-- nav -->
<nav class="relative flex flex-wrap items-center content-between py-3 px-4 dark:bg-black ">
	<div class="container mx-auto px-lg-5 sm:px-6 px-0 flex justify-between">	
		<a class="inline-block pt-1 pb-1 mr-4 text-lg whitespace-no-wrap site_logo max-lg:ml-1 max-w-36" href="/">
			{#if data.colorThemeSelected == "light"}
				<img src="images/logo.png" alt="" />
			{:else}
				<img src="images/logo-white.png" alt="" />
			{/if}
		</a>
		<Sheet.Root >
			<Sheet.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" class="lg:hidden dark:hover:bg-stone-800 px-1">
					<svg class="w-8 h-8 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/>
					  </svg>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left" id="offcanvas" class="bg-white dark:!bg-black border-r-2 border-black dark:!border-white">
			  <ul class=" text-lg-start text-center mx-auto mb-2 dark:text-white mt-16 pl-0">
				<li class="nav-item mb-4">
					<a class="nav-link dark:!text-white" href="/">How it works</a>
				</li>
				<li class="nav-item mb-4">
					<a class="nav-link dark:!text-white" href="/" on:click={() => scroll(faq)}>F.A.Q.</a>
				</li>
				<li class="nav-item">
					<a class="nav-link dark:!text-white" href="/" on:click={() => scroll(about)}>About</a>
				</li>
				</ul>
				<div
					class="flex flex-wrap items-center gap-4 lg:pt-0 justify-center mt-4"
					role="search"
				>
				<a href="/register" class="btn_black flex-1 w-full text-center text-nowrap"><span class=" dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">get started</span></a>
				<a href="/login" class="btn_white flex-1 w-full text-center text-nowrap"><span class=" dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">sign in</span></a>
				</div>
				<form method="POST" bind:this={toggleThemeForm} use:enhance={submitUpdateTheme} class="mx-auto flex justify-center mt-4" >
					{#if themeSelected && themeSelected == "dark"}
						<ThemeToggle on:click={toggleThemeSelected} formaction="/?/setTheme&theme=light&redirectTo={$page.url.pathname}" />
					{:else if themeSelected && themeSelected == "light"}
						<ThemeToggle on:click={toggleThemeSelected} formaction="/?/setTheme&theme=dark&redirectTo={$page.url.pathname}" />
					{/if}
				</form>
			</Sheet.Content>
		</Sheet.Root>
		<div class="opacity-0 flex absolute max-lg:left-0 max-lg:-translate-x-full lg:static lg:opacity-100 justify-between items-center">
			<ul class="flex gap-x-8 relative text-center mx-auto mb-2 dark:text-white uppercase font-semibold" bind:this={homeNav}>
				<li class="">
					<a class="text-black dark:!text-white no-underline" href="/" bind:this={NavHowItWorksEl} on:click={(e) => {defineHomeNavActive(e.target)}}>How it works</a>
				</li>
				<li class="">
					<a class="text-black  dark:!text-white no-underline" href="/" on:click={(e) => {
						defineHomeNavActive(e.target)
						scroll(faq)
					}}>F.A.Q.</a>
				</li>
				<li class="">
					<a class="text-black  dark:!text-white no-underline" href="/" on:click={(e) => {
						defineHomeNavActive(e.target)
						scroll(faq)
					}}>About</a>
				</li>
				<div class="home-nav-active absolute top-8 h-1 w-10 rounded-sm bg-swapee-purple transition-all duration-300 ease-in-out" style={`left: ${homeNavActiveLeft}px; transform: translate(${(homeNavActiveTranslate / 2) - 20}px, 0px);`}></div>
			</ul>
		</div>
		<div
			class="hidden lg:flex items-center gap-4 lg:pt-0"
			role="search"
		>
		<a href="/register" class="btn_black"><span class="dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">get started</span></a>
		<a href="/login" class="btn_white"><span class="dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">sign in</span></a>
		<form method="POST" bind:this={toggleThemeForm} use:enhance={submitUpdateTheme} >
			{#if themeSelected && themeSelected == "dark"}
				<ThemeToggle on:click={toggleThemeSelected} formaction="/?/setTheme&theme=light&redirectTo={$page.url.pathname}" />
			{:else if themeSelected && themeSelected == "light"}
				<ThemeToggle on:click={toggleThemeSelected} formaction="/?/setTheme&theme=dark&redirectTo={$page.url.pathname}" />
			{/if}
		</form>
		</div>
	</div>
</nav>

<!-- hero -->
<div class="site_hero md:pt-12 pt-4 dark:bg-black">
	<div class="container sm:px-6 px-3 md:pt-12 mb-16 text-center">
		<h1
			class="text-center dark:text-white f_bebas_neue text-uppercase font-bold text-5xl sm:text-6xl md:text-7xl text-stone-950 lh-1"
		>
			The easiest way to get <br />
			started with bitcoin.
		</h1>
		<p class="text-center text-stone-600 font-medium dark:!text-gray-200 mb-4">
			A simple but powerful web wallet for everyone. *No software or hardware required.*
		</p>
		<a href="/register" class="btn_purple"><span class="px-5">Start in Seconds</span></a>
	</div>
	<div class="container px-lg-5 sm:px-6 px-3">
		<div class="w-100">
			<img src="images/hero_bg.png" alt="" class="w-full slide-top" />
		</div>
	</div>
</div>

<!-- first grid -->
<section class="py-8 px-1 dark:bg-black">
	<div class="container sm:px-6 px-3">
		<div class="flex flex-wrap justify-center ">
			<div class="lg:w-1/3 md:w-1/2 lg:mb-0 mb-4">
				<div class="h-full text-center md:w-4/5 mx-auto">
					<img src="images/swapee-grid-1-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out max-h-[230px]" height="230" alt="" />
					<h5 class="f_bebas_neue font-bold dark:text-white">Create your account</h5>
					<p class="text-stone-600 dark:!text-gray-200 lh-base max-w-[425px] mx-auto">
						A username and password is all you need to get started. <a
							href="/"
							class="underline font-medium dark:!text-gray-200">Don’t forget it!</a
						>
					</p>
				</div>
				
			</div>
			<div class="lg:w-1/3 md:w-1/2 lg:mb-0 mb-4">
				<div class="h-full text-center md:w-4/5 mx-auto">
					<img src="images/swapee-grid-2-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out max-h-[230px]" height="230" alt="" />
					<h5 class="f_bebas_neue font-bold dark:text-white">Ask for payments</h5>
					<p class="text-stone-600 dark:!text-gray-200 lh-base max-w-[425px] mx-auto">
						It’s the same as you normally would traditionally, but with bitcoin.
					</p>
				</div>
			</div>
			<div class="lg:w-1/3 md:w-1/2">
				<div class="h-full text-center md:w-4/5 mx-auto">
					<img src="images/swapee-grid-3-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out max-h-[230px]" height="230" alt="" />
					<h5 class="f_bebas_neue font-bold dark:text-white">That's all!</h5>
					<p class="text-stone-600 dark:!text-gray-200 lh-base max-w-[425px] mx-auto">
						Spend your coins immediately or save it and watch it grow, the choice is yours.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- lightning network -->
<section class="py-8 px-1 dark:bg-black" bind:this={about}>
	<div class="container sm:px-6 px-3">
		<div class="flex items-center justify-center flex-col-reverse sm:flex-row">
			<div class="md:w-3/5 md:mb-0 mb-4">
				<div>
					<h6 class="f_bebas_neue text-swapee-purple">Say Goodbye to Waiting</h6>
					<h2 class="text-[2.5rem] leading-10 f_bebas_neue font-bold dark:text-white mb-3 ">
						Lightning Network <br />
						Brings Instant Payments
					</h2>
					<p class="text-stone-600 dark:!text-gray-200">
						Say goodbye to the headaches of waiting for bank settlements and dealing with
						chargebacks with our payment solution. With instant settlement and no 3% credit card
						processing fees, merchants can enjoy hassle-free retail payments.
					</p>

					<div class="mt-4 sec_btn flex gap-x-3 gap-y-3 flex-wrap">
						<a href="/" class="btn_white f_bebas_neue"><span class="dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">Learn More</span></a>
						<a href="/register" class="btn_black f_bebas_neue"><span class="dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="md:w-2/5 md:mb-0 mb-5 s xs:max-w-[80%] mx-auto">
				<div>
					<img src={data.colorThemeSelected == "light" ? "images/swapee-sec-calculator.png" : "images/swapee-sec-calculator-dark.png"} class="hover:scale-[1.015] transition-all duration-500 ease-in-out" alt="" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-8 px-1 bg-stone-100 dark:!bg-[#0D0D0D]">
	<div class="container sm:px-6 px-3">
		<div class="flex items-center justify-center flex-col sm:flex-row">
			<div class="md:w-2/5">
				<div class="scale-100 sm:scale-[1.2] xs:max-w-[80%] mx-auto">
					<img src="images/swapee-sec-2-img.png" class="slide-top" alt="" />
				</div>
			</div>

			<div class="md:w-3/5 md:mb-0 mb-4">
				<div>
					<h6 class="f_bebas_neue text-swapee-purple">Quick and painless</h6>
					<h2 class="text-[2.5rem] leading-10 f_bebas_neue font-bold dark:text-white mb-3">
						Simple to uses
					</h2>
					<p class="text-stone-600 dark:!text-gray-200 mb-4">
						Just enter an amount in your local currency, share the QR code and you’re done. We do
						all the heavy lifting so you can focus on your business. You always have the option of
						taking custody of your funds by withdrawing instantly at any time.
					</p>

					<div class="mt-4 sec_btn flex gap-x-3 gap-y-3 flex-wrap">
						<a href="/" class="btn_white f_bebas_neue"><span >Learn More</span></a>
						<a href="/register" class="btn_purple f_bebas_neue"><span >Get Started</span></a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-[12vw] px-1 relative dark:bg-black">
	<div class="container sm:px-6 px-3">
		<div class="flex items-center justify-center flex-col-reverse sm:flex-row">
			<div class="flex-1 md:mb-0">
				<div>
					<h6 class="f_bebas_neue text-swapee-purple">Customized & Personalized</h6>
					<h2 class="text-[2.5rem] leading-10 f_bebas_neue font-bold dark:text-white mb-3">
						Brand it your way!
					</h2>
					<p class="text-stone-600 dark:!text-gray-200">
						You have complete control over your profile page's aesthetic. Customize it with your
						preferred color scheme, avatar, and banner to reflect your brand, personality and
						interests.
					</p>

					<div class="sec_btn mt-4 flex gap-x-3 flex-wrap">
						<a href="/" class="btn_white f_bebas_neue mb-3"><span class="dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">Learn More</span></a>
						<a href="/register" class="btn_black f_bebas_neue mb-3"><span class="dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="flex-1 md:mb-0 mb-4 overflow-hidden relative">
				<div class="">
					<img src={data.colorThemeSelected == "light" ? "images/swapee-sec-3-img.png" : "images/swapee-sec-3-img-dark.png"} alt="" class="hover:scale-[0.985] transition-all duration-500 ease-in-out" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-8 px-1 pb-10 bg-stone-100 dark:!bg-[#0D0D0D]">
	<div class="container sm:px-6 px-3" bind:this={faq}>
		<div class="flex flex-wrap items-center justify-center">
			<div class="w-full text-center">
				<h6 class="f_bebas_neue text-swapee-purple">This might help</h6>
				<h2 class="text-[2.5rem] leading-10 f_bebas_neue font-bold dark:text-white mb-10">
					Frequently asked <br /> questions
				</h2>
			</div>

			<Accordion.Root class="w-full flex flex-col gap-3" bind:value={askedQuestionsAccordionValue} >
				{#each askedQuestionsAccordion as askedQuestionAccordion }
					<Accordion.Item value={`item-${askedQuestionAccordion.id}`} class="bg-white dark:!bg-black rounded-[10px] border-[1px] border-gray-300 px-4">
						<Accordion.Trigger class="py-0">
							<h2 class="text-base pt-3 pb-3 font-bold border-b-black dark:!border-b-swapee-purple dark:text-gray-100 !mb-0 {askedQuestionsAccordionValue == `item-${askedQuestionAccordion.id}` ? 'border-b-2' : ''}">{askedQuestionAccordion.title}</h2>
						</Accordion.Trigger>
						<Accordion.Content class="text-base text-slate-500 dark:text-gray-200 mt-0">
							<Separator orientation="horizontal" class="mt-0 mb-3 bg-purple-950" />
							<p class="mb-0">{askedQuestionAccordion.description}</p>
						</Accordion.Content>	
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>
	</div>
</section>

<!-- bitcoin_location -->
<div class="flex px-1 justify-center items-center py-[5.625rem] dark:bg-black">
	<img src="images/map.png" alt="" class="absolute dark:hidden max-h-[354px] min-h-[354px] w-full object-cover object-center" height="375">
	<img src="images/map-dark.png" alt="" class="absolute hidden dark:block max-h-[354px] min-h-[354px] w-full object-cover object-center" height="375">
	<div class="container sm:px-6 px-3">
		<h2 class="text-[2.5rem] text-center dark:text-white f_bebas_neue font-bold mb-2">
			Real-World Bitcoin Locations
		</h2>
		<p class="text-center opacity-75 md:mb-5 mb-4 dark:!text-gray-100">
			Join the <span class="text-lg font-bold">Growing businesses</span> that accept
			<span class="text-lg font-bold">Bitcoin</span>
			with <span class="text-lg font-bold">Swapee!</span>
		</p>
		<div class="flex justify-center items-center flex-wrap">
			<a href="/" class="btn_line sm:me-4 me-2 mb-4 dark:!text-white">Business Listings</a>
			<a href="/" class="btn_black"><span class="px-sm-5 dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Listed</span></a>
		</div>
	</div>
</div>

<Footer />	

<style>
	.btn_white,
	.btn_black,
	.btn_purple{
    position: relative;
    font-family: 'Work Sans', sans-serif;
    text-transform: uppercase;
    font-weight: 600;
    display: inline-block;
    text-decoration: none;
    border: 2px solid black;
    border-radius: 100px;
    -webkit-border-radius: 100px;
    -moz-border-radius: 100px;
    -ms-border-radius: 100px;
    -o-border-radius: 100px;
    transition: var(--transition_3s);
    -webkit-transition: var(--transition_3s);
    -moz-transition: var(--transition_3s);
    -ms-transition: var(--transition_3s);
    -o-transition: var(--transition_3s);
	}

	.btn_white::after,
	.btn_black::after,
	.btn_purple::after{
		content: '';
		position: absolute;
		top: 4px;
		left: 2px;
		width: 100%;
		height: 100%;
		background: black;
		border: 1px solid black;
		border-radius: 100px;
		-webkit-border-radius: 100px;
		-moz-border-radius: 100px;
		-ms-border-radius: 100px;
		-o-border-radius: 100px;
		transition: all .2s linear;
		-webkit-transition: all .2s linear;
		-moz-transition: all .2s linear;
		-ms-transition: all .2s linear;
		-o-transition: all .2s linear;
	}

	.btn_black::after{
		top: 2px;
		background: white;
	}

	.btn_purple:hover,
	.btn_white:hover,
	.btn_black:hover{
		transform: translateY(1px) translateX(1px);
		-webkit-transform: translateY(1px) translateX(1px);
		-moz-transform: translateY(1px) translateX(1px);
		-ms-transform: translateY(1px) translateX(1px);
		-o-transform: translateY(1px) translateX(1px);
	}

	.btn_black:hover::after,
	.btn_white:hover::after,
	.btn_purple:hover::after{
		transform: translateY(-2px) translateX(-2px);
		-webkit-transform: translateY(-2px) translateX(-2px);
		-moz-transform: translateY(-2px) translateX(-2px);
		-ms-transform: translateY(-2px) translateX(-2px);
		-o-transform: translateY(-2px) translateX(-2px);
	}

	.btn_black span,
	.btn_white span,
	.btn_purple span{
		color: black;
		width: 100%;
		height: 100%;
		display: block;
		padding: 8px 25px;
		background: white;
		position: relative;
		z-index: 2;
		border-radius: 100px;
		-webkit-border-radius: 100px;
		-moz-border-radius: 100px;
		-ms-border-radius: 100px;
		-o-border-radius: 100px;
	}

	.btn_black span{
		background: black;
		color: white;
	}

	.btn_purple span{
		background: rgb(113 5 243);
		color: white;
	}

	.nav_btn a:not(:last-child){
		margin-right: 15px;
	}

	.swapee_3_grids img {
		height: 230px;
		height: 65%;
		max-height: 230px;
	}

	a.btn_line{
		text-decoration: none;
		padding: 9px 25px;
		font-weight: 600;
		color: var(--bs-black);
		text-transform: uppercase;
		font-family: 'Work Sans', sans-serif;
		position: relative;
	}

	a.btn_line:hover::after {
		width: 100px;
	}

	a.btn_line::after{
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 50px;
		height: 2px;
		background: #7005f3;
		transform: translateX(-50%);
		-webkit-transform: translateX(-50%);
		-moz-transform: translateX(-50%);
		-ms-transform: translateX(-50%);
		-o-transform: translateX(-50%);
		transition: var(--transition_3s);
		-webkit-transition: var(--transition_3s);
		-moz-transition: var(--transition_3s);
		-ms-transition: var(--transition_3s);
		-o-transition: var(--transition_3s);
	}

	#offcanvas ul li a{
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		font-family: 'Work Sans', sans-serif;
		position: relative;
	}

	#offcanvas ul li a::after{
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		width: 0;
		height: 2px;
		background: #7105f3;
		transform: translateX(-50%);
		-webkit-transform: translateX(-50%);
		-moz-transform: translateX(-50%);
		-ms-transform: translateX(-50%);
		-o-transform: translateX(-50%);
		transition: var(--transition_3s);
		-webkit-transition: var(--transition_3s);
		-moz-transition: var(--transition_3s);
		-ms-transition: var(--transition_3s);
		-o-transition: var(--transition_3s);
	}

	#offcanvas ul li a:hover::after{
		width: 50px;
	}
</style>
