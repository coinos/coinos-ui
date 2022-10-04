<script>
	import { Icon, Toggle } from '$comp';
	import { t } from '$lib/translations';
	import { success, failure, put } from '$lib/utils';

	const fiats = Object.keys($rates);

	const updateFiat = async (e) => {
		try {
			$user.currency = e.target.value;
			let r = await put('/' + $user.username, { user: $user });
			success('Local currency updated');
		} catch (e) {
			failure(e.message);
		}
	};
</script>

<div>
	<label for="currency" class="font-bold block mb-1">{$t('user.settings.localCurrency')}</label>
	<select name="currency" on:change={updateFiat} class="select-styles block py-3 w-full">
		{#each fiats as fiat}
			<option value={fiat} selected={$user.currency === fiat}>{fiat}</option>
		{/each}
	</select>
</div>

<!-- TODO
<div>
	<label for="unit" class="font-bold block mb-1">{$t('user.settings.btcUnit')}</label>
	<select disabled name="unit" class="select-styles block py-3 w-full" bind:value={$user.unit}>
		<option value="SAT">{$t('user.settings.satoshis')} (SAT)</option>
		<option value="BTC">{$t('user.settings.bitcoin')} (BTC)</option>
	</select>
</div> -->
