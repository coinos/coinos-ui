<script>
  import { hex } from "@scure/base";
  import WalletPass from "$comp/WalletPass.svelte";
  import { run } from "svelte/legacy";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";
  import { arkkey } from "$lib/ark";
  import {
    getRememberedWalletPassword,
    forgetWalletPassword,
  } from "$lib/passwordCache";

  let { user, rate, account } = $props();
  let {
    name,
    seed,
    balance,
    id,
    type: accountType,
    arkAddress,
  } = $derived(account);

  let arkBalance = $state(0);
  let arkLoading = $state(false);
  let passwordPrompt = $state(false);
  let password = $state();
  let pendingUrl = $state();
  let cancel = $state(() => {
    passwordPrompt = false;
    pendingUrl = undefined;
  });

  let tryUnlockArk = async () => {
    const cached = getRememberedWalletPassword();
    if (!cached) return false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      $arkkey = hex.encode(decrypt(seed, cached));
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
        goto(pendingUrl);
      } else if (await tryUnlockArk()) {
        goto(pendingUrl);
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
    $arkkey = hex.encode(decrypt(seed, password));
    passwordPrompt = false;
    if (pendingUrl) {
      goto(pendingUrl);
      pendingUrl = undefined;
    }
  };

  let displayType = $derived(
    accountType === "ark"
      ? $t("accounts.ark")
      : seed
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
  class="shadow-lg space-y-4 p-4 cursor-pointer hover:bg-base-200"
  aria-label="Payments"
  role="button"
  tabindex="0"
  onclick={goPayments}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && goPayments(e)}
>
  <div class="flex items-start justify-between gap-4">
    <Balance {balance} {user} {rate} {id} />
    <a
      href={`/account/${id}`}
      class="font-bold text-lg opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2 shrink-0"
      aria-label="Account settings"
      onclick={goSettings}
    >
      {#if isArk}
        <img
          src="/images/ark.png"
          class="w-8 h-8 rounded-full object-cover"
          alt="Ark"
        />
      {:else if seed}
        <iconify-icon
          noobserver
          icon="cryptocurrency-color:btc"
          width="32"
        ></iconify-icon>
      {:else}
        <img src="/images/icon.png" class="w-8 h-8" />
      {/if}
      {displayName}
    </a>
  </div>

  <div class="flex w-full text-xl gap-2">
    <a
      href={"/invoice"}
      class="contents"
      onclick={(e) => setAccount(e, "/invoice")}
    >
      <button class="btn !w-auto flex-1 !bg-base-300">
        <iconify-icon
          noobserver
          icon="ph:hand-coins-bold"
          width="32"
          flip="horizontal"
        ></iconify-icon>
        <div class="my-auto hidden sm:block">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <a
      href={`/send`}
      class="contents"
      onclick={(e) => setAccount(e, "/send")}
    >
      <button type="button" class="btn !w-auto flex-1 !bg-base-300">
        <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"
        ></iconify-icon>
        <div class="my-auto hidden sm:block">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel submit={submitPassword} />
{/if}
