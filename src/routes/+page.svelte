<script>
	import { scroll } from '$lib/utils';
	let about, faq;
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
<nav class="navbar navbar-expand-lg bg-transparent py-3">
	<div class="container-xxl px-lg-5 px-sm-4 px-3">
		<a class="navbar-brand site_logo" href="#"><img src="images/logo.png" alt="" /></a>
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
			<ul class="navbar-nav text-lg-start text-center mx-auto mb-2 mb-lg-0">
				<li class="nav-item me-lg-5 mb-lg-0 mb-4">
					<a class="nav-link active" href="#">How it works</a>
				</li>
				<li class="nav-item me-lg-5 mb-lg-0 mb-4">
					<a class="nav-link" href="" on:click={() => scroll(faq)}>F.A.Q.</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="" on:click={() => scroll(about)}>About</a>
				</li>
			</ul>
			<div
				class="d-flex justify-content-lg-end justify-content-center nav_btn pt-lg-0 pt-5"
				role="search"
			>
				<a href="/register" class="btn_black"><span>get started</span></a>
				<a href="/login" class="btn_white"><span>sign in</span></a>
			</div>
		</div>
	</div>
</nav>

<!-- hero -->
<div class="site_hero pt-md-5 pt-4">
	<div class="container-lg px-sm-4 px-3 pt-md-5 text-center">
		<h1
			class="text-center text-black f_bebas_neue text-uppercase fw-bold letter_space_2 display-3 lh-1"
		>
			The easiest way to get <br />
			started with bitcoin.
		</h1>
		<p class="text-center txt_slate_blue mb-4">
			A simple but powerful web wallet for everyone. *No software or hardware required.*
		</p>
		<a href="/register" class="btn_purple"><span class="px-5">Start in Seconds</span></a>
	</div>
	<div class="container-xxl px-lg-5 px-sm-4 px-3">
		<div class="w-100">
			<img class="w-100" src="images/hero_bg.png" alt="" />
		</div>
	</div>
</div>

<!-- first grid -->
<section class="py-4">
	<div class="container-lg px-sm-4 px-3">
		<div class="row justify-content-center">
			<div class="col-lg-4 col-md-6 mb-lg-0 mb-4">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-1-3.png" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1">Create your account</h5>
					<p class="txt_slate_blue lh-base">
						A username and password is all you need to get started. <a
							href="#"
							class="swapee_grid_link">Don’t forget it!</a
						>
					</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 mb-lg-0 mb-4">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-2-3.png" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1">Ask for payments</h5>
					<p class="txt_slate_blue lh-base">
						It’s the same as you normally would traditionally, but with bitcoin.
					</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6">
				<div class="swapee_3_grids h-100 text-center col-md-10 mx-auto">
					<img src="images/swapee-grid-3-3.png" alt="" />
					<h5 class="f_bebas_neue fw-bold letter_space_1">That's all!</h5>
					<p class="txt_slate_blue lh-base">
						Spend your coins immediately or save it and watch it grow, the choice is yours.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- lightning network -->
<section class="pt-md-5" bind:this={about}>
	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center flex-md-row flex-column-reverse">
			<div class="col-md-7 mb-md-0 mb-4">
				<div>
					<h6 class="f_bebas_neue txt_purple">Say Goodbye to Waiting</h6>
					<h2 class="h1 letter_space_2 f_bebas_neue fw-bold text-black br_md_none mb-3 lh-1">
						Lightning Network <br />
						Brings Instant Payments
					</h2>
					<p class="txt_slate_blue">
						Say goodbye to the headaches of waiting for bank settlements and dealing with
						chargebacks with our payment solution. With instant settlement and no 3% credit card
						processing fees, merchants can enjoy hassle-free retail payments.
					</p>

					<div class="mt-4 sec_btn">
						<a href="#" class="btn_white f_bebas_neue"><span>Learn More</span></a>
						<a href="#" class="btn_black f_bebas_neue"><span>Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="col-md-5 mb-md-0 mb-5 scale_img_right">
				<div>
					<img src="images/swapee-sec-calculator.png" class="w-100" alt="" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="pt-5 bg_light">
	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center">
			<div class="col-md-5 scale_img_left">
				<div>
					<img src="images/swapee-sec-2-img.png" class="w-100" alt="" />
				</div>
			</div>

			<div class="col-md-7 mb-md-0 mb-4">
				<div>
					<h6 class="f_bebas_neue txt_purple">Quick and painless</h6>
					<h2 class="h1 f_bebas_neue fw-bold text-black br_md_none mb-3 letter_space_2 lh-1">
						Simple to use
					</h2>
					<p class="txt_slate_blue mb-4">
						Just enter an amount in your local currency, share the QR code and you’re done. We do
						all the heavy lifting so you can focus on your business. You always have the option of
						taking custody of your funds by withdrawing instantly at any time.
					</p>

					<div class="mt-4 sec_btn">
						<a href="#" class="btn_white f_bebas_neue"><span>Learn More</span></a>
						<a href="/register" class="btn_purple f_bebas_neue"><span>Get Started</span></a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="sec_3 position-relative">
	<div class="col-md-5 d-xxl-none d-md-block d-none position-absolute img_position">
		<div>
			<img src="images/swapee-sec-3-img.png" class="w-100" alt="" />
		</div>
	</div>

	<div class="container-lg px-sm-4 px-3">
		<div class="row align-items-center justify-content-center flex-md-row flex-column-reverse">
			<div class="col-md-6 mb-md-0 mb-4">
				<div>
					<h6 class="f_bebas_neue txt_purple">Customized & Personalized</h6>
					<h2 class="h1 letter_space_2 f_bebas_neue fw-bold text-black br_md_none mb-3 lh-1">
						Brand it your way!
					</h2>
					<p class="txt_slate_blue">
						You have complete control over your profile page's aesthetic. Customize it with your
						preferred color scheme, avatar, and banner to reflect your brand, personality and
						interests.
					</p>

					<div class="mt-4 sec_btn">
						<a href="#" class="btn_white f_bebas_neue mb-3"><span>Learn More</span></a>
						<a href="#" class="btn_black f_bebas_neue mb-3"><span>Get Started</span></a>
					</div>
				</div>
			</div>

			<div class="col-md-6 mb-md-0 mb-4 sec_3_img">
				<div class="d-xxl-block d-md-none d-block">
					<img src="images/swapee-sec-3-img.png" class="w-100" alt="" />
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-5 bg_light">
	<div class="container-lg px-sm-4 px-3" bind:this={faq}>
		<div class="row align-items-center justify-content-center">
			<div class="col-12 text-center">
				<h6 class="f_bebas_neue txt_purple">This might help</h6>
				<h2 class="h1 letter_space_2 f_bebas_neue fw-bold text-black br_md_none mb-5 lh-1">
					Frequently asked <br /> questions
				</h2>
			</div>

			<div class="accordion" id="accordionExample">
				<div class="accordion-item swapee_accordion">
					<h2 class="" id="headingOne">
						<button class="accordion-button shadow-none" type="button">
							<span class="line"> What does it cost? </span>
						</button>
					</h2>
					<div id="collapseOne">
						<div class="accordion-body">
							<p class="txt_slate_blue">
								Registering an account and receiving payments on Swapee.me is completely free. Our
								aim is to offer a smooth user experience without any financial barriers. However,
								when converting regular Bitcoin to Lightning or vice versa, we apply a modest 0.1%
								conversion fee to ensure secure and efficient transactions.
							</p>
						</div>
					</div>
				</div>

				<div class="accordion-item swapee_accordion">
					<h2 class="accordion-header" id="headingTwo">
						<button class="accordion-button shadow-none" type="button">
							<span class="line"> Do I need any special device or software? </span>
						</button>
					</h2>
					<div id="collapseTwo">
						<div class="accordion-body">
							<p class="txt_slate_blue">
								No, Swapee.me is designed to be incredibly user-friendly. You can access our
								platform using any device that can connect to a web browser - whether it's your
								mobile phone, PC, tablet, or any other compatible device. Swapee.me prioritizes
								accessibility and ease of use for all users, regardless of their chosen device.
							</p>
						</div>
					</div>
				</div>

				<div class="accordion-item swapee_accordion">
					<h2 class="accordion-header" id="headingThree">
						<button class="accordion-button shadow-none " type="button">
							<span class="line"> When do my funds settle? </span>
						</button>
					</h2>
					<div id="collapseThree" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
						<div class="accordion-body">
							<p class="txt_slate_blue">
								At Swapee.me, we value your time. Lightning payments on our platform settle
								instantly, reflecting our commitment to efficiency and user satisfaction. Forget
								waiting for extended transaction confirmations; with Swapee.me, you can experience
								the speed and efficiency of the Lightning Network firsthand.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- bitcoin_location -->
<div class="bitcoin_location">
	<div class="container-lg px-sm-4 px-3">
		<h2 class="h3 text-center text-black f_bebas_neue fw-bold letter_space_2">
			Real-World Bitcoin Locations
		</h2>
		<p class="text-center opacity-75 mb-md-5 mb-4">
			Join the <span class="fs_18 fw-bold">Growing businesses</span> that accept
			<span class="fs_18 fw-bold">Bitcoin</span>
			with <span class="fs_18 fw-bold">Swapee!</span>
		</p>
		<div class="d-flex justify-content-center align-items-start flex-wrap">
			<a href="#" class="btn_line me-sm-3 me-2 mb-4">Business Listings</a>
			<a href="#" class="btn_black"><span class="px-sm-5">Get Listed</span></a>
		</div>
	</div>
</div>

<!-- footer -->
<footer class="site_footer">
	<div class="container-lg px-4">
		<!-- footer_top -->
		<div class="footer_top pb-4">
			<div class="row align-items-center justify-content-between">
				<div class="col-md-5 mb-md-0 mb-5">
					<a href="#" class="footer_logo"><img src="images/footer-logo.png" alt="" /></a>
					<!-- <p class="text-white-50 mt-5 mb-4"> -->
					<!-- 	Copyright © 2023. Swapee.me is a Registered Cryptoasset firm and is registered with the -->
					<!-- 	UK Financial Conduct Authority. -->
					<!-- 	<br /> -->
					<!-- 	<br /> -->
					<!-- 	All rights reserved. -->
					<!-- </p> -->
					<a class="btn_language" href="#">English</a>
				</div>
				<div
					class="ps-md-4 footer_top_right col-md-6 d-flex align-items-center justify-content-end justify-content-sm-center justify-content-between"
				>
					<div class="row justify-content-md-end">
						<div class="col-sm-6 mb-xl-0 mb-4 pe-md-0 pe-sm-5">
							<h6 class="text-white opacity-75 mb-0">Business enquiries</h6>
							<a href="mailto:business@swapee.me">business@swapee.me</a>
						</div>
						<div class="col-sm-6 pe-xl-5 mb-4 pe-md-0 pe-sm-5">
							<h6 class="text-white opacity-75 mb-0">Support enquiries</h6>
							<a href="mailto:support@swapee.me">support@swapee.me</a>
						</div>
					</div>
				</div>
			</div>

			<!-- footer_bottom -->
			<div class="footer_bottom pt-4 pb-2">
				<ul class="list-unstyled mb-0 ps-0">
					<li class="pb-3">
						<a href="#">Documentation</a>
					</li>
					<li class="pb-3">
						<a href="#">Privacy Policy</a>
					</li>
					<li class="pb-3">
						<a href="#">Terms of Use</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</footer>
