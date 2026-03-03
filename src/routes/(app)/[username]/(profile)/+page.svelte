<script lang="ts">
  import PhGearBold from "virtual:icons/ph/gear-bold";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import Account from "$comp/Account.svelte";
  import Balance from "$comp/Balance.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { t } from "$lib/translations";
  import { installPrompt, password, cachedAccounts, cachedRates } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import { versions, post, fail, getCookie } from "$lib/utils";

  let { data } = $props();

  let { accounts, subject, rates, user } = $derived(data as any);
  let { locked } = $derived(user);
  let hasArk = $derived(accounts.some((a: any) => a.type === "ark"));
  let adding = $state(false);

  let addAccount = async (e) => {
    e.preventDefault();
    if (!hasArk) {
      goto("/account/new");
      return;
    }

    adding = true;
    try {
      const { getWalletEntropy } = await import("$lib/walletEntropy");
      const prfKey = await getWalletEntropy();
      if (!prfKey) {
        goto("/account/seed");
        return;
      }

      const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);

      const entropy = new Uint8Array(prfKey).slice(0, 16);
      const mn = entropyToMnemonic(entropy, wordlist);
      const seed = await mnemonicToSeed(mn);
      const master = HDKey.fromMasterSeed(seed, versions);
      const child = master.derive("m/84'/0'/0'");
      const pubkey = child.publicExtendedKey;
      const fingerprint = child.fingerprint.toString(16).padStart(8, "0");
      await post("/account", {
        fingerprint,
        pubkey,
        name: $t("accounts.vault"),
        type: "bitcoin",
        accountIndex: 0,
      });
      invalidate("app:payments");
    } catch (e: any) {
      fail(e.message);
    }
    adding = false;
  };

  let installDismissed = $state(browser && localStorage.getItem("installDismissed") === "1");
  let showInstall = $derived($installPrompt && !installDismissed);

  let install = async () => {
    if (!$installPrompt) return;
    await $installPrompt.prompt();
    $installPrompt = null;
    dismissInstall();
  };

  let dismissInstall = () => {
    installDismissed = true;
    localStorage.setItem("installDismissed", "1");
  };

  let pubkey = $state();
  $effect(() => {
    if (user) user.savings = 0;
  });
  $effect(() => {
    if (accounts?.length) $cachedAccounts = accounts;
  });
  $effect(() => {
    if (rates) $cachedRates = rates;
  });
  let { host } = $derived($page.url);
</script>

<div class="space-y-2">
  {#if user?.destination && !user?.autowithdraw}
    <div class="rounded-2xl space-y-2 p-4 shadow-lg">
      <h1 class="text-3xl font-bold">{$t("user.settings.confirmAutoWithdrawal")}</h1>
      <div>{$t("user.settings.confirmAutoWithdrawalDesc")}</div>

      <a href="/settings/account" class="btn">
        <PhGearBold width="32" />
        Settings
      </a>
    </div>
  {/if}
  {#if user?.fresh}
    <div>
      {$t("user.settings.yourUsername")}
      <b>{user?.username}</b>
      {#if $password}
        <br />
        {$t("user.settings.yourPassword")}
        <b>{$password}</b>
      {/if}
    </div>

    <a href="/settings/profile" class="btn">
      <PhGearBold width="32" />
      {$t("user.settings.continueSettingUp")}
    </a>
  {/if}
  {#if user?.id && user.id === subject.id}
    <div class="space-y-4" data-sveltekit-preload-data="false">
      {#each accounts as account}
        <Account {user} {rates} {account} />
      {/each}
      <button class="btn w-full" onclick={addAccount}>
        {#if adding}
          <Spinner />
        {:else}
          <PhPlusBold width="24" />
          {$t("accounts.addAccount")}
        {/if}
      </button>

      {#if locked}
        <div class="text-sm">{$t("incident")}</div>
      {/if}

    </div>
  {/if}
</div>

<!-- <a href="/funder" class="btn">Funder</a> -->

{#if showInstall}
  <div class="max-w-xl mx-auto flex items-center gap-3 p-4 rounded-2xl bg-base-200 lg:hidden">
    <div class="flex-1">
      <p class="font-semibold">Add Coinos to homescreen?</p>
    </div>
    <button class="btn btn-accent !w-auto px-6" onclick={install}>Yes</button>
    <button class="btn !w-auto px-6" onclick={dismissInstall}>No</button>
  </div>
{/if}

<div class="fixed inset-x-0 mx-auto flex bottom-16 px-4">
  {#if user?.username !== subject.username && (!subject.anon || subject.lud16)}
    <a
      href={subject.anon
      ? `/send/${encodeURIComponent(subject.lud16)}`
      : `/pay/${subject.username}`}
      class="contents"
    >
      <button class="btn btn-accent !text-2xl items-center !w-full sm:!max-w-[400px] mx-auto">
        <PhLightningFill class="text-yellow-300" />
        <div>{$t("user.pay")} {subject.username}</div>
      </button>
    </a>
  {/if}
</div>
