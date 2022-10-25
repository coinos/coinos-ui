<script>
	import { tick } from 'svelte';
	import { pin } from '$lib/store';
	import { Pincode, PincodeInput } from 'svelte-pincode';
	let pinCode = [];
	let pinInput;

	$: pinInput && tick().then(pinInput && pinInput.focusFirstInput);
	$: pinCode.length > 5 && ($pin = pinCode.join(''));
</script>

<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
	<div class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5">
		<h1 class="text-center text-2xl font-semibold">Please enter your PIN</h1>
		<div class="text-center">
			<Pincode bind:code={pinCode} bind:this={pinInput}>
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
			</Pincode>
		</div>

		<div class="w-full flex">
			<button
				type="submit"
				class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
			>
				<div class="my-auto">Cancel</div>
			</button>
		</div>
	</div>
</div>
