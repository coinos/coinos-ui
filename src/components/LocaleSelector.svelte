<script>
  import { run } from "svelte/legacy";

  import { t, locale, locales } from "$lib/translations";
  let { style } = $props();
  let l = $state($locale);

  const handleChange = ({ currentTarget }) => {
    const { value } = currentTarget;
    document.cookie = `lang=${value}; path=/`;
    $locale = value;
    l = value;
  };
</script>

<select name="language" bind:value={l} onchange={handleChange}>
  {#each $locales as locale}
    <option value={locale}>{$t(`lang.${locale}`)}</option>
  {/each}
</select>
