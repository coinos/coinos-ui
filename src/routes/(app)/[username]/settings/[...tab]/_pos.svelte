<script>
  import Icon from "$comp/Icon.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { locale, t } from "$lib/translations";
  import { success, fail } from "$lib/utils";
  import { page } from "$app/stores";

  export let user, rates, submit;

  let fiats = Object.keys(rates);
    $: user.language = $locale
</script>

<div>
  <label for="language" class="font-bold block mb-1"
    >{$t("user.settings.locale")}</label
  >
  <LocaleSelector style="select-styles block py-3 w-full" />
</div>

<div>
  <label for="currency" class="font-bold block mb-1"
    >{$t("user.settings.localCurrency")}</label
  >
  <select
    name="currency"
    class="select-styles block py-3 w-full"
    value={user.currency}
  >
    {#each fiats as fiat}
      <option value={fiat}>{fiat}</option>
    {/each}
  </select>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.notifications")}</span>
    <Toggle id="notify" bind:value={user.notify} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.notificationsDesc")}
  </p>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.tipPrompt")}</span>
    <Toggle id="prompt" bind:value={user.prompt} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.tipPromptDescription")}
  </p>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.publishNip5")}</span>
    <Toggle id="nip5" bind:value={user.nip5} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.nip5a")}
    <span class="font-bold">{user.username}@{$page.url.host}</span>
    {$t("user.settings.nip5b")}
  </p>
</div>

<a href="./shopify">
  <button
    type="button"
    class="flex rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full gap-2 my-5 justify-center"
  >
    <img src="/icons/shopify.svg" class="w-8" />
    <div class="my-auto">{$t("user.settings.shopify")}</div>
  </button>
</a>
