<script>
	import { Icon, Numpad } from '$comp';
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';

	export let data;
	let amount;

	let { currency } = data.user;
</script>

<form method="POST" class="flex justify-center items-center mt-24 mb-3 px-3" use:enhance>
	<input type="hidden" name="amount" value={amount} />
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
			<Icon icon="qr" style="mr-2" />
			{$t('user.receive.showQR')}
		</button>
	</div>
</form>
