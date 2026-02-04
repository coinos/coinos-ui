<script>
  import { hex } from "@scure/base";
  import WalletPass from "$comp/WalletPass.svelte";
  import { run } from "svelte/legacy";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";
  import { arkkey } from "$lib/ark";

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

  let setAccount = (event, url) => {
    event.preventDefault();
    document.cookie = `aid=${id}; path=/; max-age=86400`;
    if (isArk) {
      pendingUrl = url;
      if ($arkkey) goto(pendingUrl);
      else passwordPrompt = true;
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
    accountType === "ark" ? "Ark" : seed ? "Bitcoin" : "Custodial",
  );
  let isArk = $derived(accountType === "ark");
</script>

<div class="shadow-lg space-y-4 p-4" aria-label="Payments">
  <div class="flex items-center gap-3">
    {#if isArk}
      <img src="/images/ark.png" class="w-8 h-8 rounded-full object-cover" alt="Ark" />
    {:else if seed}
      <iconify-icon noobserver icon="cryptocurrency-color:btc" width="32"></iconify-icon>
    {:else}
      <img src="/images/icon.png" class="w-8 h-8" />
    {/if}
    <span class="font-bold text-lg">{displayType}</span>
    {#if id !== user.id}
      <a
        href={`/account/${id}`}
        class="ml-auto opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Settings"
      >
        <iconify-icon
          noobserver
          icon="ph:gear-bold"
          width="24"
        ></iconify-icon>
      </a>
    {/if}
  </div>

  <Balance {balance} {user} {rate} {id} />

  <div class="flex w-full text-xl gap-2">
    <a
      href={"/invoice"}
      class="contents"
      onclick={(e) => setAccount(e, "/invoice")}
    >
      <button class="btn !w-auto flex-1">
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
      href={"/payments"}
      class="contents"
      onclick={(e) => setAccount(e, "/payments")}
    >
      <button class="btn !w-auto flex-1">
        <iconify-icon
          noobserver
          icon="ph:clock-bold"
          width="32"
        ></iconify-icon>
        <div class="my-auto hidden sm:block">{$t("user.dashboard.history")}</div>
      </button>
    </a>

    <a
      href={`/send`}
      class="contents"
      onclick={(e) => setAccount(e, "/send")}
    >
      <button type="button" class="btn !w-auto flex-1">
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
