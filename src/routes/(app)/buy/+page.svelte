<script>
	import { enhance } from '$app/forms';
	import { Icon, Lock, Card, Calendar, Spinner } from '$comp';
	import { animatedRate } from '$lib/store';
	import { f } from '$lib/utils';

	export let data, form;

	let { username, currency } = data.user;
	let loading;

	let amount, n, d, cvc;
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
	<div class="w-full flex">
		<a href="/" class="mx-auto">
			<Icon icon="logo" />
		</a>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<div class="relative">
				<h1 class="text-2xl md:text-3xl font-semibold text-center">Buy Bitcoin</h1>
			</div>
			<p class="text-secondary text-center">Purchase up to $500 worth of Bitcoin</p>

			{#if form?.message}
				<div class="text-red-600 text-center">
					{form.message}
				</div>
			{/if}

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
						name="amount"
						placeholder="&bull;&bull;&bull;"
						bind:value={amount}
					/>
					<span
						class="absolute bottom-[9px] left-0 translate-x-1/2 w-6 text-black peer-placeholder-shown:text-gray-300 
          ">$</span
					>
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

			<div class="flex">
				<div class="text-secondary flex mr-auto">
					<div class="flex mr-1">
						<div class="my-auto mr-1">1</div>
						<img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
					</div>
				</div>
				<p class="text-secondary">3% credit card fee applies</p>
			</div>
		</div>
	</div>
</div>
