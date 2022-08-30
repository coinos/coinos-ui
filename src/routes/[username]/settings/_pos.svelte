<svelte:options accessors={true} />

<script>
	import { rates, user } from '$lib/store';
	import { Icon, Toggle, LocaleSelector } from '$comp';
	import { t } from '$lib/translations';

	const fiats = Object.keys($rates);

	const updateFiat = async (e) => {
		try {
			$user.currency = e.target.value;
			let r = await put('/' + $user.username, { user: $user });
			success('Local currency updated!');
		} catch (e) {
			failure(e.message);
		}
	};
</script>

<div>
	<label for="currency" class="font-bold block mb-1">{$t('user.settings.localCurrency')}</label>
	<select name="currency" on:change={updateFiat} class="block py-3 w-full">
		{#each fiats as fiat}
			<option value={fiat} selected={$user.currency === fiat}>{fiat}</option>
		{/each}
	</select>
</div>

<div>
	<label for="btc-unit" class="font-bold block mb-1">{$t('user.settings.btcUnit')}</label>
	<select disabled name="btc-unit" class="block py-3 w-full">
		<option value="SATS">{$t('user.settings.satoshis')} (SAT)</option>
		<option value="BTC">{$t('user.settings.bitcoin')} (BTC)</option>
	</select>
</div>
