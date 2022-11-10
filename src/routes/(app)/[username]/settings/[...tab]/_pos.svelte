<script>
	import { Icon, Toggle } from '$comp';
	import { t } from '$lib/translations';
	import { success, failure } from '$lib/utils';
	import { page } from '$app/stores';

	export let user, rates;
	const fiats = Object.keys(rates);
</script>

<div>
	<label for="currency" class="font-bold block mb-1">{$t('user.settings.localCurrency')}</label>
	<select name="currency" class="select-styles block py-3 w-full" value={user.currency}>
		{#each fiats as fiat}
			<option value={fiat}>{fiat}</option>
		{/each}
	</select>
</div>
