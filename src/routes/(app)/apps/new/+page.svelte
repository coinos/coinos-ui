<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import AppForm from "$comp/AppForm.svelte";
  import { untrack } from "svelte";
  import {
    PUBLIC_COINOS_PUBKEY as walletPubkey,
    PUBLIC_COINOS_RELAY as relayUrl,
  } from "$env/static/public";

  let { data, form } = $props();
  let { app, rate, user } = $derived(data);
  let lud16 = $derived(`${user.username}@${$page.url.host}`);

  onMount(() => {
    if (browser) {
      if (window.opener) {
        window.opener.postMessage({ relayUrl, lud16, walletPubkey }, "*");
      } else {
        console.warn("No window.opener found.");
      }
    }
  });
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h2 class="text-2xl font-bold mb-2">{$t("accounts.connection")}</h2>

  {#if form?.error}
    <div class="text-red-600 text-center">
      {form.error}
    </div>
  {/if}

  <AppForm {...app} {rate} {user} />
</div>
