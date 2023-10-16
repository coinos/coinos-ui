<script>
	import { Icon, LocaleSelector, Toggle } from '$comp';
	import { t } from '$lib/translations';
	import { success, fail } from '$lib/utils';
	import { page } from '$app/stores';

	export let user, rates;
	let fiats = Object.keys(rates);
</script>

<div>
	<label for="language" class="font-bold block mb-1">{$t('user.settings.locale')}</label>
	<LocaleSelector style="select-styles block py-3 w-full" />
</div>

<div>
	<label for="currency" class="font-bold block mb-1">{$t('user.settings.localCurrency')}</label>
	<select name="currency" class="select-styles block py-3 w-full" value={user.currency}>
		{#each fiats as fiat}
			<option value={fiat}>{fiat}</option>
		{/each}
	</select>
</div>

<div>
	<div class="flex justify-between items-center">
		<span class="font-bold">{$t('user.settings.tipPrompt')}</span>
		<Toggle id="prompt" checked={user.prompt} bind:value={user.prompt} />
	</div>
	<p class="text-secondary mt-1 w-9/12">
		{$t('user.settings.tipPromptDescription')}
	</p>
</div>

<a href="./shopify">
	<button
		class="flex rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full gap-2 my-5 justify-center"
	>
		<img src="/icons/shopify.svg" class="w-8" />
		<div class="my-auto">Shopify Integration</div>
	</button>
</a>
