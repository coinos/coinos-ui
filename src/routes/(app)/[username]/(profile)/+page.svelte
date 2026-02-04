<script>
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { btc, f, sat } from "$lib/utils";
  import Account from "$comp/Account.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";
  import { installPrompt, password } from "$lib/store";
  import { afterNavigate, preloadData } from "$app/navigation";
  import { page } from "$app/stores";

  let { data } = $props();

  afterNavigate(() => {
    if (user) preloadData(`/${user.username}/receive`);
    preloadData("/send");
  });

  let { accounts, subject, rate, user } = $derived(data);
  let { locked } = $derived(user);

  let install = async () => {
    if (!$installPrompt) return;
    await $installPrompt.prompt();
    $installPrompt = null;
  };

  let pubkey = $state();
  $effect(() => {
    if (user) user.savings = 0;
  });
  let { host } = $derived($page.url);
</script>

<div class="space-y-2">
  {#if user?.destination && !user?.autowithdraw}
    <div class="rounded-2xl space-y-2 p-4 shadow-lg">
      <h1 class="text-3xl font-bold">
        {$t("user.settings.confirmAutoWithdrawal")}
      </h1>
      <div>
        {$t("user.settings.confirmAutoWithdrawalDesc")}
      </div>

      <a href="/settings/account" class="btn">
        <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
        Settings</a
      >
    </div>
  {/if}
  {#if user?.fresh}
    <div>
      {$t("user.settings.yourUsername")} <b>{user?.username}</b>
      {#if $password}
        <br />
        {$t("user.settings.yourPassword")}
        <b>{$password}</b>{/if}
    </div>

    <a href="/settings/profile" class="btn">
      <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
      {$t("user.settings.continueSettingUp")}</a
    >
  {/if}
  {#if user?.id && user.id === subject.id}
    <div class="space-y-10 pb-8" data-sveltekit-preload-data="false">
      {#each accounts as account}
        <Account {user} {rate} {account} />
      {/each}
    </div>

    {#if locked}
      <div class="text-sm">
        {$t("incident")}
      </div>
    {/if}

    {#if $installPrompt}
      <button class="btn btn-accent lg:hidden" onclick={install}>
        <iconify-icon noobserver icon="ph:floppy-disk-bold" width="32"
        ></iconify-icon>
        {$t("user.install")}
      </button>
    {/if}
  {/if}
</div>

<!-- <a href="/funder" class="btn">Funder</a> -->

<div class="fixed inset-x-0 mx-auto flex bottom-16 px-4">
  {#if user?.username !== subject.username && (!subject.anon || subject.lud16)}
    <a
      href={subject.anon
        ? `/send/${encodeURIComponent(subject.lud16)}`
        : `/pay/${subject.username}`}
      class="contents"
    >
      <button
        class="btn btn-accent !text-2xl items-center !w-full sm:!max-w-[400px] mx-auto"
      >
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>
        <div>
          {$t("user.pay")}
          {subject.username}
        </div>
      </button>
    </a>
  {/if}
</div>
