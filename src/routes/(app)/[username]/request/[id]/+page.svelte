<script>
	import { scale } from 'svelte/transition';
	import { Avatar, Icon } from '$comp';
	import { f, sat, sats } from '$lib/utils';
	import { request as req, requestRedirect } from '$lib/store';

	export let data;
	let { request, user } = data;
	let { amount, rate, currency } = request.invoice;
	let fiat = (amount * rate) / sats;
	req.set();
</script>

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-8">
	<div class="flex w-full max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
		<Icon icon="check" style="mx-auto" />
	</div>

	<div class="text-center mb-8 space-y-5">
		<p class="text-5xl break-words">
			<span class="text-xl md:text-2xl">Sent invoice to</span>
		</p>
		<div class="flex p-1 gap-2 justify-center">
			<Avatar user={request.requester} size={20} />
			<p class="text-4xl break-words my-auto">{request.requester.username}</p>
		</div>
		<div>
			<h2 class="text-2xl md:text-3xl font-semibold">
				{f(fiat, currency)}
			</h2>
			<h3 class="text-secondary md:text-lg mb-6 mt-1">{sat(amount)}</h3>
		</div>
	</div>
</div>

<a href={$requestRedirect || `/${user.username}/dashboard`}>
	<div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>
