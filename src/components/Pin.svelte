<script>
	import { t } from '$lib/translations';
	import { focus } from '$lib/utils';
	import { Pinpad } from '$comp';

	export let value = '';
	export let title = $t('user.settings.verifyPIN');
	export let cancel = () => (pin = '');

	let pin = '';

	$: update(value);
	let update = (v) => (pin = v);

	$: pin.toString().length > 5 && (value = pin.toString());
</script>

<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
	<div class="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5">
		<h1 class="text-center text-2xl font-semibold">{title}</h1>
		<Pinpad bind:v={pin} {cancel} />
		<div class="w-full flex">
			<button
				class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
				on:click|preventDefault={cancel}
			>
				<div class="my-auto">Cancel</div>
			</button>
		</div>
	</div>
</div>
