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

  let { user, rate, account, last } = $props();
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
    accountType === "ark" ? "Ark" : seed ? "Savings" : "Cash",
  );
  let isArk = $derived(accountType === "ark");
</script>

<div
  class="block space-y-2 border-primary py-4"
  class:border-b-8={!last}
  aria-label="Payments"
>
  <div class="flex">
    <Balance {balance} {user} {rate} {id} />
    {#if id !== user.id}
      <a
        href={id === user.id ? "/settings/nostr" : `/account/${id}`}
        class="contents"
        aria-label="Settings"
      >
        <button class="flex gap-1 mb-auto pb-4 pl-4 ml-auto" aria-label="Settings">
          <iconify-icon
            noobserver
            icon="ph:gear-bold"
            width="32"
            aria-label="Settings"
          ></iconify-icon>
        </button>
      </a>
    {/if}
  </div>

  <div class="flex justify-center w-full text-xl gap-2">
    <a
      href={"/invoice"}
      class="contents"
      onclick={(e) => setAccount(e, "/invoice")}
    >
      <button class="btn !w-auto flex-grow">
        <iconify-icon
          noobserver
          icon="ph:hand-coins-bold"
          width="32"
          flip="horizontal"
        ></iconify-icon>
        <div class="my-auto">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <!-- <a -->
    <!--   href={"/payments"} -->
    <!--   class="contents" -->
    <!--   onclick={(e) => setAccount(e, "/payments")} -->
    <!-- > -->
    <!--   <button class="btn !w-auto flex-grow"> -->
    <!--     <iconify-icon -->
    <!--       noobserver -->
    <!--       icon="ph:clock-bold" -->
    <!--       width="32" -->
    <!--       flip="horizontal" -->
    <!--     ></iconify-icon> -->
    <!--   </button> -->
    <!-- </a> -->

    <a
      href={`/send`}
      class="contents grow"
      onclick={(e) => setAccount(e, "/send")}
    >
      <button type="button" class="btn !w-auto flex-grow">
        <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"
        ></iconify-icon>
        <div class="my-auto">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel submit={submitPassword} />
{/if}
