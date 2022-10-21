<script>
	import { LandingHeader } from '$comp';
	import { loginRedirect } from '$lib/store';
	import { beforeNavigate } from '$app/navigation';
	import { info } from '$lib/utils';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { goto } from '$app/navigation';
	import { scroll } from '$lib/utils';

	export let data;
	let { user, tickets } = data;
	$loginRedirect = '/launch/purchase';

	let hasTicket = !!user?.accounts.find((a) => tickets.includes(a.asset));
	$: link = hasTicket ? '/launch/ticket' : user ? $loginRedirect : '/register';
	$: text = (hasTicket ? 'View' : 'Purchase') + ' Ticket';

	beforeNavigate(({ to }) => {
		if (to?.routeId === 'register') info('Please sign in so we can get you a ticket');
	});

	let showMobileMenu = false;
	const mobileMenuButtonClick = (section) => {
		showMobileMenu = false;
		scroll(section);
	};
</script>

<header class="w-full lg:w-5/6 py-5 mx-auto fixed md:sticky z-10 top-0 bg-white/90">
	<nav class="block xl:flex flex-wrap justify-between items-center">
		<div class="flex justify-start md:justify-center items-center md:space-x-10">
			<a href="/" class="hidden md:block">
				<Icon icon="logo" style="mb-5 xl:mb-0" />
			</a>
			<Icon icon="logo" style="block md:hidden ml-5 w-48" />
		</div>
	</nav>
</header>

<div class="mx-auto flex items-center justify-center px-8 mt-20">
	<div class="flex flex-col w-full bg-white rounded shadow-lg sm:w-3/4 lg:w-3/5">
		<div class="flex flex-col w-full md:flex-row">
			<div
				class="flex flex-row justify-around p-4 font-bold leading-none text-gray-800 uppercase bg-gray-400 rounded md:flex-col md:items-center md:justify-center md:w-1/4"
			>
				<div class="md:text-3xl">Oct</div>
				<div class="md:text-6xl">26</div>
				<div class="md:text-xl">6 pm</div>
			</div>
			<div class="p-4 font-normal text-gray-800 md:w-3/4 space-y-5">
				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800">
					Launch Party!
				</h1>

				<p class="leading-normal mb-2">
					Come join us at our launch party celebrating our new design and 10 years serving the
					Vancouver Bitcoin community!
				</p>

				<div class="flex">
					<div class="space-y-5">
						<div class="ml-8">
							<p><b>When</b></p>
							<p>6pm October 26</p>
						</div>
						<div class="ml-8">
							<p><b>Where</b></p>
							<p>The Loft Lounge</p>
							<p>1184 Denman Street, #203</p>
							<p>Vancouver, BC</p>
						</div>
					</div>

					<img src="/icons/party.svg" alt="Partygoers" class="w-[120px] mx-auto" />
				</div>

				<p>
					We'll introduce our new interface and then network and enjoy tasty food and drinks from <a
						href="https://loftondenman.com/"
						class="underline">The Loft</a
					>!
				</p>

				<p>
					The Loft will be accepting Lightning payments at the event and going forward into the
					future as well! We're charging $6 for for an NFT ticket that gets you entry, appies, and the
					chance to win some swag and sats.
				</p>

				<div class="flex w-full my-8">
					<a href={link} class="mx-auto">
						<button
							class="bg-white text-black border rounded-full px-8 py-4 font-bold hover:opacity-80 text-2xl"
						>
							{text}
						</button>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
