<script>
	import { enhance } from '$app/forms';
	import { Icon, Lock, Card, Calendar, Spinner } from '$comp';

	export let data;

	let { username } = data.user;
	let loading;

  let amount = 100;
	let n = '4242 4242 4242 4242';
	let d = '10/25';
	let cvc = 444;
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center text-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<div class="relative">
				<!-- <p class="absolute right-0 top-1 underline"><Icon icon="settings" /></p> -->
				<h1 class="text-2xl md:text-3xl font-semibold">Buy Bitcoin</h1>
			</div>
			<p class="text-secondary">Purchase up to $500 worth of Bitcoin from us.</p>

			<p class="text-secondary">
				If you want more, try <a href="https://www.kraken.com/" target="_blank" class="text-black"
					>Kraken</a
				>
				or
				<a href="https://shakepay.com/" target="_blank" class="text-black">ShakePay</a> or ask
				around at our next
				<a href="https://www.meetup.com/vancouver-bitcoiners" target="_blank" class="text-black"
					>meetup</a
				>.
			</p>

			<form
				method="POST"
				class="flex flex-wrap gap-5 w-full p-5 mt-20"
				use:enhance={() => {
					loading = true;
					return ({ update }) => update() && (loading = false);
				}}
			>
				<input type="hidden" name="username" value={username} />

				<label class="relative w-full flex flex-col">
					<span class="font-bold mb-3">Amount</span>
					<input
						class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
						type="text"
						name="number"
						placeholder="500"
						bind:value={amount}
					/>
					<span class="absolute text-gray-300 bottom-[9px] left-0 translate-x-1/2 w-6">$</span>
				</label>

				<label class="relative w-full flex flex-col">
					<span class="font-bold mb-3">Card number</span>
					<input
						class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
						type="text"
						name="number"
						placeholder="0000 0000 0000 0000"
						bind:value={n}
					/>
					<Card />
				</label>

				<label class="relative flex-1 flex flex-col">
					<span class="font-bold mb-3">Expire date</span>
					<input
						class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
						type="text"
						name="expiry"
						placeholder="MM/YY"
						bind:value={d}
					/>
					<Calendar />
				</label>

				<label class="relative flex-1 flex flex-col">
					<span class="font-bold flex items-center gap-3 mb-3">
						CVC/CVV
						<span class="relative group">
							<span
								class="hidden group-hover:flex justify-center items-center px-2 py-1 text-xs absolute -right-2 transform translate-x-full -translate-y-1/2 w-max top-1/2 bg-black text-white"
							>
								3-digit number on the back of your card</span
							>
						</span>
					</span>
					<input
						class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
						type="text"
						name="cvc"
						placeholder="&bull;&bull;&bull;"
						bind:value={cvc}
					/>
					<Lock />
				</label>

				<div class="w-full flex mt-8">
					<button
						class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-xl"
						type="submit"
						disabled={loading}
					>
						{#if loading}
							<Spinner />
						{:else}
							Submit
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
