<script>
  import { getNsec } from "$lib/nostr";
  import { page } from "$app/stores";
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { copy } from "$lib/utils";
  import {
    PUBLIC_COINOS_PUBKEY as pk,
    PUBLIC_COINOS_RELAY as relay,
  } from "$env/static/public";

  let { data } = $props();
  let { user } = $derived(data);
  let { id, npub } = $derived(user);

  let importing = $state(),
    nwc = $state(),
    newNsec = $state(),
    nsec = $state(),
    pin = $state(""),
    revealNsec = $state();

  let toggleImporting = () => {
    revealNsec = false;
    importing = !importing;
  };

  let toggleNsec = async () => {
    try {
      nsec = await getNsec(user);
      revealNsec = !revealNsec;
      importing = false;
    } catch (e) {
      console.log(e);
    }
  };

  let lud16 = $derived(`${user.username}@${$page.url.host}`);
  let revealNwc = () =>
    (nwc = `nostr+walletconnect://${pk}?relay=${encodeURIComponent(
      relay,
    )}&secret=${user.nwc}&lud16=${lud16}`);
</script>

<div>
  <label for="nwc" class="font-bold">{$t("user.settings.nwc")}</label>

  <p class="text-secondary mb-1">
    {$t("user.settings.nwcDescription")}
  </p>

  <div class="flex flex-wrap justify-center gap-2">
    <a href={nwc} class="btn grow">
      <img src="/images/nostr.png" class="w-8" />
      <div class="my-auto">{$t("user.settings.connectNostr")}</div>
    </a>

    {#if !nwc}
    <button onclick={revealNwc} type="button" class="btn grow">
      <iconify-icon icon="ph:warning-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("accounts.revealNwc")}</div></button
    >
    {/if}
  </div>
</div>

{#if nwc}
  <div class="break-all grow">
    {nwc}
  </div>
  <div class="flex flex-wrap gap-2">
    <button onclick={() => copy(nwc)} type="button" class="btn grow">
      <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("accounts.copy")}</div></button
    >
    <a href={`/qr/${encodeURIComponent(nwc)}`} class="btn grow">
      <iconify-icon icon="ph:qr-code-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("user.receive.showQR")}</div>
    </a>
  </div>
{/if}

<div>
  <div class="font-bold">{$t("user.nostrPubkey")}</div>
  <div class="flex gap-4">
    <div class="break-all grow">
      {npub}
    </div>
    <div class="flex my-auto gap-1">
      <button type="button" class="my-auto" onclick={() => copy(npub)}
        ><iconify-icon icon="ph:copy-bold" width="32"></iconify-icon></button
      >
      <a href={`/qr/${encodeURIComponent(npub)}`} class="my-auto">
        <iconify-icon icon="ph:qr-code-bold" width="32"></iconify-icon>
      </a>
    </div>
  </div>
</div>

<div class="space-y-2">
  <label for="seedphrase" class="font-bold"
    >{$t("user.settings.nostrKeys")}</label
  >

  <p class="text-secondary mb-1">
    {$t("user.settings.nostrDescription")}
  </p>

  <div class="flex flex-wrap sm:flex-nowrap gap-2">
    <button
      type="button"
      class="btn !w-auto flex-grow"
      onclick={toggleImporting}
    >
      <iconify-icon icon="ph:arrow-down-left-bold" width="32"></iconify-icon>
      {$t("user.settings.import")}
    </button>

    <button type="button" class="btn !w-auto flex-grow" onclick={toggleNsec}>
      {#if revealNsec}
        <iconify-icon icon="ph:eye-slash-bold" width="32"></iconify-icon>
        {$t("user.settings.hideNsec")}
      {:else}
        <iconify-icon icon="ph:warning-bold" width="32"></iconify-icon>
        {$t("user.settings.revealNsec")}
      {/if}
    </button>
  </div>

  {#if importing}
    <input name="newNsec" bind:value={newNsec} placeholder="nsec..." />
  {/if}

  {#if revealNsec}
    <button
      type="button"
      class="btn break-all !h-auto font-normal leading-normal flex-nowrap"
      onclick={() => copy(nsec)}
    >
      <div>{nsec}</div>

      <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
    </button>
  {/if}
</div>
