<script>
  import { t, locale, locales } from "$lib/translations";
  export let style;

  const handleChange = ({ currentTarget }) => {
    const { value } = currentTarget;
    document.cookie = `lang=${value}; path=/`;
    $locale = value;
  };
</script>

<select name="language" class={style} on:change={handleChange}>
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
