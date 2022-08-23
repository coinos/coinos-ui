<script>
	import { locale, locales } from '$lib/translations';
	export let style;
</script>

<select name="language" bind:value={$locale} class={style}>
	{#each $locales as locale}
		<option value={locale}>{locale}</option>
	{/each}
</select>
