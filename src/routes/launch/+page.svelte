<script>
	import { redirect } from '$lib/store';

	export let data;
	let { user } = data;
	$: link = user ? '/launch/purchase' : '/register';
	$redirect = '/launch/purchase';
</script>

<div class="flex mt-20 px-8">
	<img
		src="/images/ticket.webp"
		class="mb-8 md:max-w-xl mx-auto border border-gray-400"
	/>
</div>
<div class="mx-auto flex  items-center justify-center px-8">
	<div class="flex flex-col w-full bg-white rounded shadow-lg sm:w-3/4 md:w-1/2 lg:w-3/5">
		<div class="flex flex-col w-full md:flex-row">
			<div
				class="flex flex-row justify-around p-4 font-bold leading-none text-gray-800 uppercase bg-gray-400 rounded md:flex-col md:items-center md:justify-center md:w-1/4"
			>
				<div class="md:text-3xl">Oct</div>
				<div class="md:text-6xl">5</div>
				<div class="md:text-xl">6 pm</div>
			</div>
			<div class="p-4 font-normal text-gray-800 md:w-3/4">
				<h1 class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800">
					Coinos Launch Party
				</h1>
				<p class="leading-normal mb-2">
					Come join us at our launch party celebrating 10 years in business! We'll be introducing
					our newly designed payments interface and afterwards we'll network and enjoy tasty food
					and drinks from <a href="https://loftondenman.com/" class="underline">The Loft</a>!
				</p>

				<div class="flex w-full my-8">
					<a href={link}>
						<button
							class="bg-white text-black border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-2xl"
						>
							Purchase Ticket
						</button>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
