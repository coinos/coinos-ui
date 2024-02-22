<script>
    import { enhance } from "$app/forms";
	import * as Accordion from "$lib/shadcn/components/ui/accordion";
	import { Separator } from "$lib/shadcn/components/ui/separator";
	import { page } from '$app/stores';
	import { t } from "$lib/translations";
	import { scroll } from '$lib/utils';
    import ThemeToggle from "../components/buttons/ThemeToggle.svelte";
    import Footer from "../components/Footer.svelte";
	
	export let data;
	let about, faq;
	let askedQuestionsAccordionValue = "item-0"

	let askedQuestionsAccordion = [
		{id: 0, title: "What does it cost?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."},
		{id: 1, title: "Do I need any special device or software?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."},
		{id: 2, title: "When do my funds settle?", description: "It's free to register an account and receive payments. We charge a 0.1% conversion fee if you withdraw regular bitcoin to lightning or vice versa."}
	]

	let themeSelected = data.colorThemeSelected;
	let toggleThemeForm;

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

</script>

<svelte:head>
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
		rel="stylesheet"
		integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
		crossorigin="anonymous"
	/>
	<link href="responsive.css" rel="stylesheet" />
	<link href="style.css" rel="stylesheet" />

	<!-- Bootstrap JS -->
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4"
		crossorigin="anonymous"
	></script>
</svelte:head>

<!-- aleart -->
<div
	class="top_alert position-relative alert bg_purple mb-0 alert-dismissible fade show border_radius_0"
	role="alert"
>
	<p class="text-center mb-0 text-white fw-semibold">
		It's important not to forget your <span class="txt_yellow">username</span> and
		<span class="txt_yellow">password</span> since we don't have access to those details.
	</p>
	<button
		type="button"
		class="bg-transparent border-0 shadow-none"
		data-bs-dismiss="alert"
		aria-label="Close"><img src="images/cross-icon.png" alt="" /></button
	>
</div>

<!-- nav -->
<nav class="navbar navbar-expand-lg dark:bg-black py-3 ">
	<div class="container-xxl px-lg-5 px-sm-4 px-3">
		<a class="navbar-brand site_logo" href="#">
			{#if data.colorThemeSelected == "light"}
				<img src="images/logo.png" alt="" />
			{:else}
				<img src="images/logo-white.png" alt="" />
			{/if}
		</a>
		<button
			class="navbar-toggler border-0 shadow-none"
			type="button"
			data-bs-toggle="offcanvas"
			data-bs-target="#offcanvas"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="offcanvas offcanvas-start flex-lg-row flex-column" id="offcanvas">
			<div class="py-4 pb-5 px-3 d-lg-none d-flex justify-content-end w-100">
				<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
			</div>
			<ul class="navbar-nav text-lg-start text-center mx-auto mb-2 mb-lg-0 dark:text-white">
				<li class="nav-item me-lg-5 mb-lg-0 mb-4">
					<a class="nav-link active dark:!text-white" href="#">How it works</a>
				</li>
				<li class="nav-item me-lg-5 mb-lg-0 mb-4">
					<a class="nav-link dark:!text-white" href="" on:click={() => scroll(faq)}>F.A.Q.</a>
				</li>
				<li class="nav-item">
					<a class="nav-link dark:!text-white" href="" on:click={() => scroll(about)}>About</a>
				</li>
			</ul>
			<div
				class="flex items-center gap-4 lg:pt-0"
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
	</div>
</nav>

<!-- hero -->
<div class="site_hero pt-md-5 pt-4 dark:bg-black">
	<div class="container-lg px-sm-4 px-3 pt-md-5 mb-16  text-center">
		<h1
			class="text-center dark:text-white f_bebas_neue text-uppercase fw-bold letter_space_2 display-3 lh-1"
		>
			The easiest way to get <br />
			started with bitcoin.
		</h1>
		<p class="text-center txt_slate_blue dark:!text-gray-200 mb-4">
			A simple but powerful web wallet for everyone. *No software or hardware required.*
		</p>
		<a href="/register" class="btn_purple"><span class="px-5">Start in Seconds</span></a>
	</div>
	<div class="container-xxl px-lg-5 px-sm-4 px-3">
		<div class="w-100">
			<img src="images/hero_bg.png" alt="" class="w-full slide-top" />
		</div>
	</div>
</div>

<!-- first grid -->
<section class="py-4 dark:bg-black">
	<div class="container-lg px-sm-4 px-3">
		<div class="row justify-content-center">
			<div class="col-lg-4 col-md-6 mb-lg-0 mb-4">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-1-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1 dark:text-white">Create your account</h5>
					<p class="txt_slate_blue dark:!text-gray-200 lh-base">
						A username and password is all you need to get started. <a
							href="#"
							class="swapee_grid_link">Don’t forget it!</a
						>
					</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 mb-lg-0 mb-4">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-2-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1 dark:text-white">Ask for payments</h5>
					<p class="txt_slate_blue dark:!text-gray-200 lh-base">
						It’s the same as you normally would traditionally, but with bitcoin.
					</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-3-3.png" class="mx-auto hover:scale-[1.025] transition-all duration-500 ease-in-out" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1 dark:text-white">That's all!</h5>
					<p class="txt_slate_blue dark:!text-gray-200 lh-base">
						Spend your coins immediately or save it and watch it grow, the choice is yours.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- lightning network -->
<section class="pt-md-5 dark:bg-black" bind:this={about}>
	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center flex-md-row flex-column-reverse">
			<div class="col-md-7 mb-md-0 mb-4">
				<div>
					<h6 class="f_bebas_neue txt_purple">Say Goodbye to Waiting</h6>
					<h2 class="h1 letter_space_2 f_bebas_neue fw-bold dark:text-white br_md_none mb-3 lh-1">
						Lightning Network <br />
						Brings Instant Payments
					</h2>
					<p class="txt_slate_blue dark:!text-gray-200">
						Say goodbye to the headaches of waiting for bank settlements and dealing with
						chargebacks with our payment solution. With instant settlement and no 3% credit card
						processing fees, merchants can enjoy hassle-free retail payments.
					</p>

					<div class="mt-4 sec_btn flex gap-x-3 gap-y-3 flex-wrap">
						<a href="#" class="btn_white f_bebas_neue"><span class="dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">Learn More</span></a>
						<a href="/register" class="btn_black f_bebas_neue"><span class="dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="col-md-5 mb-md-0 mb-5 scale_img_rig">
				<div>
					<img src={data.colorThemeSelected == "light" ? "images/swapee-sec-calculator.png" : "images/swapee-sec-calculator-dark.png"} class="hover:scale-[1.015] transition-all duration-500 ease-in-out" alt="" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="pt-5 bg_light dark:!bg-[#0D0D0D]">
	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center">
			<div class="col-md-5">
				<div>
					<img src="images/swapee-sec-2-img.png" class="slide-top" alt="" />
				</div>
			</div>

			<div class="col-md-7 mb-md-0 mb-4">
				<div>
					<h6 class="f_bebas_neue txt_purple">Quick and painless</h6>
					<h2 class="h1 f_bebas_neue fw-bold dark:text-white br_md_none mb-3 letter_space_2 lh-1">
						Simple to uses
					</h2>
					<p class="txt_slate_blue dark:!text-gray-200 mb-4">
						Just enter an amount in your local currency, share the QR code and you’re done. We do
						all the heavy lifting so you can focus on your business. You always have the option of
						taking custody of your funds by withdrawing instantly at any time.
					</p>

					<div class="mt-4 sec_btn flex gap-x-3 gap-y-3 flex-wrap">
						<a href="#" class="btn_white f_bebas_neue"><span >Learn More</span></a>
						<a href="/register" class="btn_purple f_bebas_neue"><span >Get Started</span></a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="sec_3 position-relative dark:bg-black">
	<div class="col-md-5 d-xxl-none d-md-block d-none position-absolute img_position">
		<div>
			<img src={data.colorThemeSelected == "light" ? "images/swapee-sec-3-img.png" : "images/swapee-sec-3-img-dark.png"} alt="" class="hover:scale-[0.985] transition-all duration-500 ease-in-out" />
		</div>
	</div>

	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center flex-md-row flex-column-reverse">
			<div class="col-md-6 mb-md-0">
				<div>
					<h6 class="f_bebas_neue txt_purple">Customized & Personalized</h6>
					<h2 class="h1 letter_space_2 f_bebas_neue fw-bold dark:text-white br_md_none mb-3 lh-1">
						Brand it your way!
					</h2>
					<p class="txt_slate_blue dark:!text-gray-200">
						You have complete control over your profile page's aesthetic. Customize it with your
						preferred color scheme, avatar, and banner to reflect your brand, personality and
						interests.
					</p>

					<div class="sec_btn mt-4 flex gap-x-3 flex-wrap">
						<a href="#" class="btn_white f_bebas_neue mb-3"><span class="dark:!bg-black dark:!text-white dark:!border-white dark:!border-2">Learn More</span></a>
						<a href="/register" class="btn_black f_bebas_neue mb-3"><span class="dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="col-md-6 mb-md-0 mb-4 overflow-hidden">
				<div class="d-xxl-block d-md-none d-block">
					<img src={data.colorThemeSelected == "light" ? "images/swapee-sec-3-img.png" : "images/swapee-sec-3-img-dark.png"} alt="" class="hover:scale-[0.985] transition-all duration-500 ease-in-out" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-5 bg_light dark:!bg-[#0D0D0D]">
	<div class="container-lg px-sm-4 px-3" bind:this={faq}>
		<div class="row align-items-center justify-content-center">
			<div class="col-12 text-center">
				<h6 class="f_bebas_neue txt_purple">This might help</h6>
				<h2 class="h1 letter_space_2 f_bebas_neue fw-bold dark:text-white br_md_none mb-5 lh-1">
					Frequently asked <br /> questions
				</h2>
			</div>

			<Accordion.Root class="w-full flex flex-col gap-3" bind:value={askedQuestionsAccordionValue} >
				{#each askedQuestionsAccordion as askedQuestionAccordion }
					<Accordion.Item value={`item-${askedQuestionAccordion.id}`} class="bg-white dark:!bg-black rounded-[10px] border-[1px] border-gray-300 px-4">
						<Accordion.Trigger class="py-0">
							<h2 class="text-base pt-3 pb-3 font-bold border-b-black dark:!border-b-swapee-purple {askedQuestionsAccordionValue == `item-${askedQuestionAccordion.id}` ? 'border-b-2' : ''}">{askedQuestionAccordion.title}</h2>
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
<div class="bitcoin_location dark:bg-black bg-map-light dark:!bg-map-dark bg-no-repeat">
	<div class="container-lg px-sm-4 px-3">
		<h2 class="h3 text-center dark:text-white f_bebas_neue fw-bold letter_space_2">
			Real-World Bitcoin Locations
		</h2>
		<p class="text-center opacity-75 mb-md-5 mb-4">
			Join the <span class="fs_18 fw-bold">Growing businesses</span> that accept
			<span class="fs_18 fw-bold">Bitcoin</span>
			with <span class="fs_18 fw-bold">Swapee!</span>
		</p>
		<div class="d-flex justify-content-center align-items-start flex-wrap">
			<a href="#" class="btn_line me-sm-3 me-2 mb-4 dark:!text-white">Business Listings</a>
			<a href="#" class="btn_black"><span class="px-sm-5 dark:!bg-white dark:!text-black dark:!border-black dark:!border-2">Get Listed</span></a>
		</div>
	</div>
</div>

<Footer />