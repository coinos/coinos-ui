<script>
	import { Avatar, Icon, Numpad } from '$comp';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invoices, request } from '$lib/store';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let data;
	export let form;

	let req;

	$: load($page);
	let load = () => {
		if ($request) {
			req = { ...$request };
			$request = null;
		}
	};

	let amount;

	let { currency, username } = data.subject;
	let { user } = data;

	$: paid = browser && form && Object.values($invoices).find((inv) => inv.amount === form.amount);
	$: paid && goto(`/invoice/${paid.uuid}/paid`);
</script>

{#if form && req}
	<div class="container px-4 mt-20 max-w-xl mx-auto space-y-8">
		<div class="text-center mb-8 space-y-5">
			<p class="text-5xl break-words">
				<span class="text-xl md:text-2xl">Invoice sent to</span>
			</p>

			<div class="flex p-1 gap-2 justify-center">
				<Avatar user={req.requester} size={'20'} />
				<p class="text-4xl break-words my-auto">{req.requester.username}</p>
			</div>
		</div>
		<div class="text-center">
			<a href={`/${user.username}/dashboard`} class="mx-auto text-center">
				<button class="bg-black text-white rounded-2xl w-20 py-3 font-bold hover:opacity-80">
					Done
				</button>
			</a>
		</div>
	</div>
{:else}
	<form method="POST" class="flex justify-center items-center mt-24 mb-3 px-3" use:enhance>
		<input type="hidden" name="amount" value={amount} />
		<input type="hidden" name="currency" value={currency} />
		<input type="hidden" name="username" value={username} />

		{#if req}
			<input type="hidden" name="requester" value={req.requester.username} />
		{/if}

		<input type="hidden" name="prompt" value="true" />

		<div class="space-y-3 w-full md:w-[300px] mx-auto">
			<Numpad bind:amount bind:currency />
			<button
				type="submit"
				class="bg-black text-white rounded-xl w-full h-[48px] flex justify-center items-center font-semibold {!amount
					? 'opacity-50'
					: 'opacity-100 hover:opacity-80'}"
				disabled={!amount}
			>
				Next
			</button>
		</div>
	</form>
{/if}
