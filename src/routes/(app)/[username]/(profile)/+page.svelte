<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import Account from "$comp/Account.svelte";
  import Balance from "$comp/Balance.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { t } from "$lib/translations";
  import { installPrompt, password } from "$lib/store";
  import { afterNavigate, goto, invalidate, preloadData } from "$app/navigation";
  import { page } from "$app/stores";
  import { versions, post, fail } from "$lib/utils";

  let { data } = $props();

  afterNavigate(() => {
    if (user) preloadData(`/${user.username}/receive`);
    preloadData("/send");
  });

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
      <h1 class="text-3xl font-bold">{$t("user.settings.confirmAutoWithdrawal")}</h1>
      <div>{$t("user.settings.confirmAutoWithdrawalDesc")}</div>

      <a href="/settings/account" class="btn">
        <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
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
      <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
      {$t("user.settings.continueSettingUp")}
    </a>
  {/if}
  {#if user?.id && user.id === subject.id}
    <div class="space-y-4" data-sveltekit-preload-data="false">
      {#each accounts as account}
        <Account {user} {rates} {account} />
      {/each}
      <button class="btn btn-accent w-full" onclick={addAccount}>
        {#if adding}
          <Spinner />
        {:else}
          <iconify-icon noobserver icon="ph:plus-bold" width="24"></iconify-icon>
          {$t("accounts.addAccount")}
        {/if}
      </button>

      {#if locked}
        <div class="text-sm">{$t("incident")}</div>
      {/if}

      {#if $installPrompt}
        <button class="btn btn-accent w-full lg:hidden" onclick={install}>
          <iconify-icon noobserver icon="ph:download-bold" width="32"></iconify-icon>
          {$t("user.install")}
        </button>
      {/if}
    </div>
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
      <button class="btn btn-accent !text-2xl items-center !w-full sm:!max-w-[400px] mx-auto">
        <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
        <div>{$t("user.pay")}{subject.username}</div>
      </button>
    </a>
  {/if}
</div>
