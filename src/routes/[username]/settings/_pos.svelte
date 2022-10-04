<script>
	import { Icon, Toggle } from '$comp';
	import { t } from '$lib/translations';
	import { success, failure } from '$lib/utils';

	export let rates, user;

	const fiats = Object.keys(rates);
</script>

<div>
	<label for="currency" class="font-bold block mb-1">{$t('user.settings.localCurrency')}</label>
	<select name="currency" class="select-styles block py-3 w-full">
		{#each fiats as fiat}
			<option value={fiat} selected={user.currency === fiat}>{fiat}</option>
		{/each}
	</select>
</div>

<!-- TODO
<div>
	<label for="unit" class="font-bold block mb-1">{$t('user.settings.btcUnit')}</label>
	<select disabled name="unit" class="select-styles block py-3 w-full" bind:value={user.unit}>
		<option value="SAT">{$t('user.settings.satoshis')} (SAT)</option>
		<option value="BTC">{$t('user.settings.bitcoin')} (BTC)</option>
	</select>
</div> -->
