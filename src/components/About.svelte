<script>
	import { Image, Icon } from '$comp';
</script>

<div>
	<h3 class="text-5xl font-medium mb-10 text-center">About</h3>
	<div
		class="md:px-10 lg:px-0 block lg:flex justify-center text-secondary text-xl lg:space-x-20 mx-auto max-w-7xl relative"
	>
		<p class="w-full lg:w-5/12">
			Coinos is an open source bitcoin web wallet, point of sale, ecommerce marketplace and exchange
			platform. Development started in Vancouver in September 2012 as a way to provide local
			merchants with a convenient way to accept bitcoin payments.
			<br /><br />
			The feature set has grown over the years to accomodate a wide variety of use cases with the goal
			of making it as easy as possible for anyone to get started using Bitcoin quickly, cheaply, and
			securely.
			<br /><br />
			Anyone can download the source code and host their own instance of the platform backed by their
			own bitcoin, liquid or lightning nodes, or reach out and we'll gladly set this up for you.
			<Image
				image="swoosh"
				style="w-32 absolute -bottom-20 left-28 md:left-72 xl:left-96 lg:bottom-0"
			/>
		</p>
		<p class="w-full lg:w-5/12">
			Once signed in, you can create both custodial and non-custodial wallets within your account.
			The default custodial wallet allows funds to be deposited on any of the bitcoin, liquid or
			lightning networks and seamlessly withdrawn over any other network without any conversion
			process or fee.
			<br /><br />
			Using a non-custodial wallet means keys are generated client-side in your browser so we never have
			access to the funds. Transactions from these accounts are subject to on-chain transaction fees
			and Lightning Network payments are not supported but we advise using this account type or a paper
			wallet for storing larger amounts.
			<br /><br />
			Intra-account transfers between custodial wallets of different users on our server are completely
			free, instant, and unlimited.
		</p>
	</div>

	<div class="px-5 block lg:flex justify-center lg:space-x-32 items-center mt-40 lg:mt-20">
		<div class="space-y-5 mb-5 lg:mb-0">
			<h3 class="text-5xl font-medium mb-10 text-center lg:text-right">The Founder</h3>

			<Image image="adam" style="rounded-full mx-auto lg:mx-0 lg:ml-auto w-40" />

			<div class="space-y-2">
				<span class="text-2xl text-center font-semibold block lg:text-right">Adam Soltys</span>
				<span class="text-xl text-center text-secondary block lg:text-right"
					>Chief Technical Officer</span
				>
			</div>

			<div class="flex justify-center lg:justify-end items-center space-x-5">
				<a
					href="https://twitter.com/adamsoltys"
					target="_blank"
					rel="noreferrer"
					class="rounded-full p-2 bg-[#1D9BF0]"><Icon icon="twitter" style="w-6" /></a
				>
				<a
					href="https://github.com/asoltys"
					target="_blank"
					rel="noreferrer"
					class="rounded-full p-2 bg-gray-800"><Icon icon="github" style="w-6" /></a
				>
			</div>
		</div>

		<ul
			class="w-full mx-auto md:w-[700px] lg:w-[500px] xl:w-auto text-secondary px-1 md:px-10 text-xl list-disc space-y-5"
		>
			<li>Running Bitcoin since 2011</li>
			<li>20+ years web development experience in government and industry</li>
			<li>Early Bitcoin Vancouver meetup organizer</li>
			<li>Founder of The Bitcoin Co-op and early supporter of Decentral Vancouver</li>
			<li>Yogi, permaculturist, anarchist, decentralist</li>
			<li>Husband, father, brother, son</li>
		</ul>
	</div>
</div>
