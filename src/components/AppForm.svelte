<script>
  import { browser } from "$app/environment";
  import { applyAction, deserialize } from "$app/forms";
  import { page } from "$app/stores";
  import Numpad from "$comp/Numpad.svelte";
  import { getPublicKey } from "nostr-tools";
  import { onMount, tick } from "svelte";
  import { bytesToHex, randomBytes } from "@noble/hashes/utils";
  import { goto } from "$app/navigation";
  import { copy, focus, fail, post } from "$lib/utils";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import {
    PUBLIC_COINOS_PUBKEY as walletPubkey,
    PUBLIC_COINOS_RELAY as relayUrl,
  } from "$env/static/public";

  let { rate, user, name, max_amount, budget_renewal, pubkey, secret } =
    $props();
  let { currency } = $derived(user);

  onMount(() => {
    if (!pubkey) secret || generate();
    if (!budget_renewal) budget_renewal = "never";
  });

  let generate = () => {
    secret = bytesToHex(randomBytes(32));
    pubkey = getPublicKey(secret);
  };

  let lud16 = $derived(`${user.username}@${$page.url.host}`);

  let el = $state();
  let submit = async (e) => {
    e.preventDefault();
    let body = new FormData(el);
    let params = { method: "POST", body };
    let url = $page.url.pathname;

    const response = await fetch(url, params);
    const result = deserialize(await response.text());

    if (result.type === "redirect") {
      let type = "nwc:success";
      let msg = { relayUrl, lud16, walletPubkey, type };
      if (browser && window.opener) window.opener.postMessage(msg, "*");
    }

    applyAction(result);
  };

  let del = async () => {
    try {
      await post(`/post/apps/delete`, { pubkey });
      goto("/settings/nostr");
    } catch (e) {
      fail(e.message);
    }
  };

  let settingBudget = $state();
  let setBudget = () => {
    settingBudget = false;
  };
  let done = $state();
  let startSetting = async () => {
    settingBudget = true;
    await tick();
    numpad.focus();
  };
  let numpad = $state();
</script>

<form method="POST" class="space-y-5" onsubmit={submit} bind:this={el}>
  <div>
    <label for="name" class="font-bold mb-1 block">{$t("accounts.name")}</label>
    <input type="text" name="name" bind:value={name} use:focus />
  </div>

  <div>
    <label for="name" class="font-bold mb-1 block"
      >{$t("accounts.budget")}</label
    >

    <button type="button" class="flex w-full" onclick={startSetting}>
      <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>
      </div>
      <div
        class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left"
      >
        {max_amount || $t("accounts.none")}
      </div>
      <input type="hidden" name="max_amount" bind:value={max_amount} />
    </button>
  </div>

  <div>
    <label for="name" class="font-bold mb-1 block"
      >{$t("accounts.renewal")}</label
    >
    <select name="budget_renewal" bind:value={budget_renewal}>
      <option value="never" selected>{$t("accounts.never")}</option>
      <option value="daily">{$t("accounts.daily")}</option>
      <option value="weekly">{$t("accounts.weekly")}</option>
      <option value="monthly">{$t("accounts.monthly")}</option>
      <option value="yearly">{$t("accounts.yearly")}</option>
    </select>
  </div>

  <div>
    <label for="pubkey" class="font-bold mb-1 block"
      >{$t("accounts.pubkey")}</label
    >
    <div class="flex gap-1 items-center">
      <textarea
        rows={3}
        name="pubkey"
        bind:value={pubkey}
        class="grow"
        readonly={secret}
      />
      <button
        type="button"
        onclick={() => copy(pubkey)}
        class="btn !w-auto shrink"
      >
        <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
      </button>
    </div>
  </div>

  {#if !pubkey || secret}
    <div>
      <label for="secret" class="font-bold mb-1 block"
        >{$t("accounts.secret")}</label
      >
      <div class="flex gap-1 items-center">
        <textarea rows={3} name="secret" bind:value={secret} lcass="grow" />

        <div class="space-y-2 w-24">
          <button type="button" onclick={generate} class="btn">
            <iconify-icon noobserver icon="ph:dice-three-bold" width="32"
            ></iconify-icon>
          </button>
          <button type="button" onclick={() => copy(secret)} class="btn">
            <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="space-y-2">
    <button type="submit" class="btn btn-accent">{$t("payments.submit")}</button
    >
    {#if pubkey}
      <button type="button" class="btn" onclick={del}>
        <iconify-icon icon="ph:trash-bold" width="32"></iconify-icon>
        {$t("accounts.delete")}</button
      >
    {/if}
  </div>
</form>

{#if settingBudget}
  <div
    class="fixed bg-base-100 bg-opacity-90 inset-0 overflow-y-auto h-full w-full z-50 max-w-lg mx-auto"
  >
    <div class="relative p-5 border shadow-lg rounded-md bg-base-100 space-y-5">
      <h1 class="text-center text-2xl font-semibold">
        {$t("accounts.budget")}
      </h1>
      <Numpad
        bind:amount={max_amount}
        {currency}
        {rate}
        bind:submit={done}
        bind:element={numpad}
      />

      <button bind:this={done} type="button" onclick={setBudget} class="btn"
        >Ok</button
      >
    </div>
  </div>
{/if}
