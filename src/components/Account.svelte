<script lang="ts">
  import { hex } from "@scure/base";
  import { bytesToHex } from "@noble/hashes/utils.js";
  import WalletPass from "$comp/WalletPass.svelte";
  import { run } from "svelte/legacy";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";
  import { versions, s, f, loc, toFiat } from "$lib/utils";
  import { fiat } from "$lib/store";
  import { arkkey } from "$lib/ark";
  import { getRememberedWalletPassword, forgetWalletPassword } from "$lib/passwordCache";

  let { user, rate, account }: any = $props();
  let { name, seed, fingerprint, balance, pending, id, type: accountType, arkAddress } = $derived(account);

  let arkBalance = $state(0);
  let arkLoading = $state(false);
  let passwordPrompt = $state(false);
  let password: string | undefined = $state();
  let pendingUrl: string | undefined = $state();
  let cancel = $state(() => {
    passwordPrompt = false;
    pendingUrl = undefined;
  });

  let tryUnlockArk = async () => {
    const cached = getRememberedWalletPassword();
    if (!cached) return false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      if (seed) {
        // Legacy: per-account seed is raw hex key
        $arkkey = hex.encode(decrypt(seed, cached) as Uint8Array);
      } else if (user.seed) {
        // Master seed: derive m/86'/0'/0'/0/0
        const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
          import("@scure/bip32"),
          import("@scure/bip39"),
          import("@scure/bip39/wordlists/english.js"),
        ]);
        let entropy = await decrypt(user.seed, cached);
        let mnemonic = entropyToMnemonic(entropy, wordlist);
        let s = await mnemonicToSeed(mnemonic, cached);
        let master = HDKey.fromMasterSeed(s, versions);
        let arkChild = master.derive("m/86'/0'/0'/0/0");
        $arkkey = bytesToHex(arkChild.privateKey!);
      } else {
        return false;
      }
      return true;
    } catch (e) {
      forgetWalletPassword();
      return false;
    }
  };

  let setAccount = async (event, url) => {
    event.preventDefault();
    event.stopPropagation();
    document.cookie = `aid=${id}; path=/; max-age=86400`;
    if (isArk) {
      pendingUrl = url;
      if ($arkkey) {
        goto(pendingUrl!);
      } else if (await tryUnlockArk()) {
        goto(pendingUrl!);
      } else {
        passwordPrompt = true;
      }
    } else {
      $arkkey = undefined;
      goto(url);
    }
  };

  let submitPassword = async () => {
    const { decrypt } = await import("nostr-tools/nip49");
    if (seed) {
      $arkkey = hex.encode(decrypt(seed, password!) as Uint8Array);
    } else if (user.seed) {
      const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);
      let entropy = await decrypt(user.seed, password!);
      let mnemonic = entropyToMnemonic(entropy, wordlist);
      let s = await mnemonicToSeed(mnemonic, password!);
      let master = HDKey.fromMasterSeed(s, versions);
      let arkChild = master.derive("m/86'/0'/0'/0/0");
      $arkkey = bytesToHex(arkChild.privateKey!);
    }
    passwordPrompt = false;
    if (pendingUrl) {
      goto(pendingUrl);
      pendingUrl = undefined;
    }
  };

  let displayType = $derived(
    accountType === "ark"
      ? $t("accounts.ark")
      : seed || (user.seed && fingerprint)
        ? $t("accounts.bitcoin")
        : $t("accounts.custodial"),
  );
  let displayName = $derived(name || displayType);
  let isArk = $derived(accountType === "ark");

  let goPayments = (e) => {
    e.preventDefault();
    setAccount(e, "/payments");
  };

  let goSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.cookie = `aid=${id}; path=/; max-age=86400`;
    goto(`/account/${id}`);
  };
</script>

<div
  class="space-y-4 p-4 cursor-pointer hover:bg-base-200"
  aria-label="Payments"
  data-testid="account-card"
  data-account-type={accountType}
  role="button"
  tabindex="0"
  onclick={goPayments}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && goPayments(e)}
>
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="text-lg text-gray-400">{displayName}</div>
      <Balance {balance} {user} {rate} {id} />
      {#if pending}
        <div class="text-lg text-gray-600">
          +{$fiat && rate ? f(toFiat(pending, rate), user.currency, loc(user)) : s(pending)} pending
        </div>
      {/if}
    </div>
    <div class="flex items-start gap-4 shrink-0 text-gray-600">
      <div class="flex items-center justify-center w-8 h-8 leading-[0]">
        {#if isArk}
          <img src="/images/ark.png" class="w-8 h-8 rounded-full object-cover" alt="Ark" />
        {:else if seed || (user.seed && fingerprint)}
          <iconify-icon noobserver icon="cryptocurrency-color:btc" width="32"></iconify-icon>
        {:else}
          <img src="/images/icon.png" class="w-8 h-8" alt="Coinos" />
        {/if}
      </div>
      <a
        href="/payments"
        class="hover:text-gray-800"
        aria-label="Payment history"
        onclick={(e) => setAccount(e, "/payments")}
      >
        <iconify-icon noobserver icon="ph:clock-counter-clockwise-bold" width="32"></iconify-icon>
      </a>
      <a
        href={`/account/${id}`}
        class="hover:text-gray-800"
        aria-label="Account settings"
        onclick={goSettings}
      >
        <iconify-icon noobserver icon="ph:gear-bold" width="32"></iconify-icon>
      </a>
    </div>
  </div>

  <div class="flex w-full text-xl gap-2">
    <a href={"/invoice"} class="contents" onclick={(e) => setAccount(e, "/invoice")}>
      <button class="btn !w-auto flex-1" data-testid="account-receive">
        <iconify-icon noobserver icon="ph:hand-coins-bold" width="32" flip="horizontal"
        ></iconify-icon>
        <div class="my-auto hidden sm:block">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <a href={`/send`} class="contents" onclick={(e) => setAccount(e, "/send")}>
      <button type="button" class="btn btn-accent !w-auto flex-1">
        <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"></iconify-icon>
        <div class="my-auto hidden sm:block">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel submit={submitPassword} />
{/if}
