<script lang="ts">
  import { browser } from "$app/environment";
  import { applyAction, deserialize } from "$app/forms";
  import { page } from "$app/stores";
  import AmountField from "$comp/AmountField.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { onMount, tick } from "svelte";
  import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";
  import { goto } from "$app/navigation";
  import { copy, focus, fail, post } from "$lib/utils";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import {
    PUBLIC_COINOS_PUBKEY as walletPubkey,
    PUBLIC_COINOS_RELAY as relayUrl,
  } from "$env/static/public";

  let {
    rate,
    user,
    name,
    max_fee,
    max_amount,
    budget_renewal,
    pubkey,
    secret,
    notify,
  } = $props();
  let { currency } = $derived(user);

  onMount(() => {
    if (!pubkey) secret || generate();
    if (!budget_renewal) budget_renewal = "never";
  });

  let generate = async () => {
    secret = bytesToHex(randomBytes(32));
    const { getPublicKey } = await import("nostr-tools");
    pubkey = getPublicKey(secret);
  };

  let lud16 = $derived(`${user.username}@${$page.url.host}`);

  let el: HTMLFormElement | undefined = $state();
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
    } catch (e: any) {
      fail(e.message);
    }
  };
</script>

<form method="POST" class="space-y-5" onsubmit={submit} bind:this={el}>
  <div>
    <label for="name" class="font-bold mb-1 block">{$t("accounts.name")}</label>
    <input type="text" name="name" bind:value={name} use:focus />
  </div>

  <AmountField
    {currency}
    {rate}
    bind:amount={max_amount}
    name={"max_amount"}
    label={$t("accounts.budget")}
  />

  <AmountField
    none="1%"
    {currency}
    {rate}
    bind:amount={max_fee}
    name={"max_fee"}
    label={$t("accounts.maxfee")}
  />

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
    <label for="notify" class="font-bold mb-1 block"
      >{$t("accounts.notifications")}</label
    >
    <select name="notify" bind:value={notify}>
      <option value={false} selected>{$t("accounts.off")}</option>
      <option value={true}>{$t("accounts.on")}</option>
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
      ></textarea>
      <button
        type="button"
        onclick={() => copy(pubkey)}
        class="btn !w-auto shrink"
        aria-label="Copy public key"
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
        <textarea
          rows={3}
          name="secret"
          bind:value={secret}
          class="grow"
        ></textarea>

        <div class="space-y-2 w-24">
          <button
            type="button"
            onclick={generate}
            class="btn"
            aria-label="Generate secret"
          >
            <iconify-icon noobserver icon="ph:dice-three-bold" width="32"
            ></iconify-icon>
          </button>
          <button
            type="button"
            onclick={() => copy(secret)}
            class="btn"
            aria-label="Copy secret"
          >
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
