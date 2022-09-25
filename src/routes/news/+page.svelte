<script>
	import { Icon, Footer, Check, Quote } from '$comp';
	import { t } from '$lib/translations';
</script>

<a href="/">
	<Icon icon="logo" style="mx-auto mt-10" />
</a>
<div class="w-11/12 md:w-3/4 lg:w-1/2 2xl:w-1/3 max-w-3xl mx-auto my-20 space-y-5">
	<h1 class="text-5xl font-medium">{$t('news.header')}</h1>

	<h2 class="text-2xl font-medium">{$t('news.subheader')}</h2>

	<p class="text-xl font-semibold">Press Release - coinos Redesign - September 23, 2022</p>

	<p class="text-xl text-secondary">
		Today coinos is launching a new and improved interface for their open source web wallet,
		allowing businesses to accept bitcoin with no setup or merchant fees.
	</p>

	<p class="text-xl text-secondary">
		coinos is a web-based bitcoin payment application that is mobile and tablet friendly with handy
		currency conversion and reporting features. bitcoin is the world's leading crypto currency. It
		offers a secure and inexpensive way for people all over the globe to make and accept payments.
	</p>

	<blockquote
		class="p-4 my-4 bg-gray-50 border-l-4 border-gray-300 dark:border-gray-500 dark:bg-gray-800 text-xl text-secondary"
	>
		<Quote /> coinos has enabled businesses to accept bitcoin since 2012, but now we have made it even
		easier with a new simple, friendly and customizable interface for both businesses and customers to
		use.
		<figcaption class="flex justify-center items-center mt-6 space-x-3">
			<img class="w-6 h-6 rounded-full" src="/images/adam.webp" alt="Adam Soltys" />
			<div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
				<cite class="pr-3 font-medium text-gray-900 dark:text-white">Adam Soltys</cite>
				<cite class="pl-3 text-sm font-light text-gray-500 dark:text-gray-400">Founder and CTO</cite
				>
			</div>
		</figcaption>
	</blockquote>

	<p class="text-xl text-secondary">
		coinos started as an indie bitcoin wallet created by Adam Soltys with the intention of providing
		people with a fast, cheap, and easy way to get started with bitcoin. It's free to register an
		account and you can sign up with just a username and password.
	</p>

	<h3 class="text-xl font-semibold">Why accept bitcoin?</h3>
	<blockquote
		class="p-4 my-4 bg-gray-50 border-l-4 border-gray-300 dark:border-gray-500 dark:bg-gray-800 text-xl text-secondary"
	>
		<Quote />
		We have already brought on some local businesses, here in Vancouver, and the business owners are
		excited about the opportunity coinos is giving them to attract new customers by being able to accept
		bitcoin. With coinos there are no set up fees, no merchant fees and transactions are safe and secure
		with payments going directly to the business owner's wallet. There is no middle person.
		<figcaption class="flex justify-center items-center mt-6 space-x-3">
			<img class="w-6 h-6 rounded-full" src="/images/cole.webp" alt="Adam Soltys" />
			<div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
				<cite class="pr-3 font-medium text-gray-900 dark:text-white">Cole Goodwin</cite>
				<cite class="pl-3 text-sm font-light text-gray-500 dark:text-gray-400"
					>Bitcoin Professional</cite
				>
			</div>
		</figcaption>
	</blockquote>

	<h3 class="text-xl font-semibold">coinos Timeline</h3>
	<ul class="text-xl text-secondary">
		<li class="flex items-center space-x-3">
			<Check />
			2012 Coding started
		</li>
		<li class="flex items-center space-x-3">
			<Check />
			2013 Used by merchants in Vancouver to accept on-chain bitcoin
		</li>
		<li class="flex items-center space-x-3">
			<Check />
			2018 Lightning network supported
		</li>
		<li class="flex items-center space-x-3">
			<Check />
			2020 Incorporated in BC and registered with Fintrac
		</li>
		<li class="flex items-center space-x-3">
			<Check />
			2021 Liquid Network and asset issuance supported
		</li>
		<li class="flex items-center space-x-3">
			<Check />
			2022 10 year anniversary and UI redesign
		</li>
	</ul>

	<h3 class="text-xl font-semibold">Contacts</h3>

	<p class="text-xl text-secondary">
		<b>Adam Soltys</b> - Founder & CTO<br />
		<a class="hover:opacity-80" href="mailto:adam@coinos.io ">adam@coinos.io</a>
	</p>

	<p class="text-xl text-secondary">
		<b>Cole Goodwin</b> - Bitcoin Professional<br />
		<a class="hover:opacity-80" href="mailto:cole@coinos.io">cole@coinos.io</a>
	</p>

	<p class="text-xl text-secondary">
		<b>Shauna Collister</b> - Operations & Marketing<br />
		<a class="hover:opacity-80" href="mailto:shauna@coinos.io">shauna@coinos.io</a>
	</p>
</div>

<Footer />
