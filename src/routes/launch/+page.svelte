<script>
	import { redirect } from '$lib/store';
	import { beforeNavigate } from '$app/navigation';
	import { info } from '$lib/utils';

	export let data;
	let { user } = data;
	$: link = user ? '/launch/purchase' : '/register';
	$redirect = '/launch/purchase';

	beforeNavigate(({ to }) => {
		if (to.routeId === 'register') info('Please sign in so we can get you a ticket');
	});
</script>

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
					Coinos Launch Party!
				</h1>

				<p class="leading-normal mb-2">
        Come join us at our launch party celebrating our new design and 10 years since our <a href="https://github.com/coinos/coinos-server/commit/b25d11b" class="underline">first commit</a>!
				</p>
				<div class="ml-8">
					<p><b>When</b></p>
					<p>6pm on October 26</p>
				</div>
				<div class="ml-8">
					<p><b>Where</b></p>
					<p>1184 Denman Street, #203</p>
					<p>Vancouver, BC</p>
				</div>

				<p>
					We'll introduce our new interface for merchants to take bitcoin payments and afterwards
					we'll network and enjoy tasty food and drinks from <a
						href="https://loftondenman.com/"
						class="underline">The Loft</a
					>!
				</p>

				<p>
					We're charging a nominal $6 entry fee so we can get an idea of how much space to reserve.
				</p>

				<div class="flex w-full my-8">
					<a href={link} class="mx-auto">
						<button
							class="bg-white text-black border rounded-full px-8 py-4 font-bold hover:opacity-80 text-2xl"
						>
							Purchase Ticket
						</button>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
