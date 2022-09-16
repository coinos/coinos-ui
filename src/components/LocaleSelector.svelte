<script>
	import { t, locale, locales } from '$lib/translations';
	export let style;
</script>

<select name="language" bind:value={$locale} class={style}>
	{#each $locales as locale}
		<option value={locale}>{$t(`lang.${locale}`)}</option>
	{/each}
</select>

<style>
	select {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
</style>
