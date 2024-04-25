<script>
	import { enhance } from '$app/forms';
  import Icon from "$comp/Icon.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { t } from "$lib/translations";
  import { success, fail } from "$lib/utils";
  import { page } from "$app/stores";
  import { onMount } from 'svelte';
  import ThemeToggle from '../../../../../components/buttons/ThemeToggle.svelte';
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let user, rates, submit;

  let fiats = Object.keys(rates);

  let themeSelected;
	let toggleThemeForm;
  
  onMount(() => {
    themeSelected = document.documentElement.classList[0];
  })

	function toggleThemeSelected() {
		themeSelected = themeSelected == "dark" ? "light" : "dark"; 
    submitUpdateTheme(themeSelected);
	}

	function submitUpdateTheme(theme) {
		const htmlClasses = document.documentElement.classList;
		if (theme == "dark" && !(htmlClasses.contains("dark"))) {
      htmlClasses.add("dark");
      htmlClasses.remove("light");
		} else if (theme == "light" && !(htmlClasses.contains("light"))) {
			htmlClasses.add("light");
			htmlClasses.remove("dark");
		}
    dispatch("changeTheme", theme)
	}
</script>

<div>
  <label for="language" class="font-bold block mb-3"
    >{$t("user.settings.locale")}</label
  >
  <LocaleSelector style="select-styles block py-3 w-full dark:bg-stone-800 dark:border-0" />
</div>

<div>
  <label for="currency" class="font-bold block mb-3 "
    >{$t("user.settings.localCurrency")}</label
  >
  <select
    name="currency"
    class="select-styles block py-3 w-full dark:bg-stone-800 dark:border-0"
    value={user.currency}
  >
    {#each fiats as fiat}
      <option value={fiat}>{fiat}</option>
    {/each}
  </select>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">Dark Theme</span>
    {#if themeSelected}
      <button type="button" on:click={toggleThemeSelected} class="focus:ring-4 ring-gray-300 dark:ring-gray-800 rounded-full inline-flex relative items-center mr-5 cursor-pointer ">
          <div
          class="w-11 h-6 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 {themeSelected == 'dark' ? ' dark:bg-green-500' : 'bg-gray-200 after:-translate-x-full'} after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 "
          />
      </button>
		{/if}
  </div>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.notifications")}</span>
    <Toggle id="notify" bind:value={user.notify} />
  </div>
  <p class="text-secondary dark:text-gray-200 mt-1 w-9/12">
    {$t("user.settings.notificationsDesc")}
  </p>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.tipPrompt")}</span>
    <Toggle id="prompt" bind:value={user.prompt} />
  </div>
  <p class="text-secondary dark:text-gray-200 mt-1 w-9/12">
    {$t("user.settings.tipPromptDescription")}
  </p>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.publishNip5")}</span>
    <Toggle id="nip5" bind:value={user.nip5} />
  </div>
  <p class="text-secondary dark:text-gray-200 mt-1 w-9/12">
    {$t("user.settings.nip5a")}
    <span class="font-bold">{user.username}@{$page.url.host}</span>
    {$t("user.settings.nip5b")}
  </p>
</div>

<a href="./shopify">
  <button
    type="button"
    class="flex rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full gap-2 my-5 justify-center dark:border-white"
  >
    <img src="/icons/shopify.svg" alt="" class="w-8" />
    <div class="my-auto">Shopify Integration</div>
  </button>
</a>
