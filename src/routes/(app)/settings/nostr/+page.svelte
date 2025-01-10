<script>
  import { browser } from "$app/environment";
  import { getNsec } from "$lib/nostr";
  import { page } from "$app/stores";
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { copy, fail } from "$lib/utils";
  import {
    PUBLIC_COINOS_PUBKEY as pk,
    PUBLIC_COINOS_RELAY as relay,
  } from "$env/static/public";
  import { signer, save } from "$lib/store";

  let { data } = $props();
  let { challenge, user } = $derived(data);
  let { npub } = $state(user);
  let extensionAvailable = $derived(browser && window.nostr);

  let newNsec = $state(),
    nsec = $state(),
    pin = $state(""),
    revealNsec = $state(),
    revealNwc = $state();

  let toggleNsec = async () => {
    try {
      nsec = await getNsec(user);
      revealNsec = !revealNsec;
    } catch (e) {
      fail("Failed to decrypt nsec");
    }
  };

  let lud16 = $derived(`${user.username}@${$page.url.host}`);
  let nwc = $derived(
    `nostr+walletconnect://${pk}?relay=${encodeURIComponent(
      relay,
    )}&secret=${user.nwc}&lud16=${lud16}`,
  );
  let toggleNwc = () => (revealNwc = !revealNwc);

  let extension = $state();
  let getPubkey = async () => {
    extension = true;
    npub = await window.nostr.getPublicKey();
    await tick();
    $save.click();
  };
</script>

<div>
  <input type="hidden" name="challenge" value={challenge} />
  <input type="hidden" name="extension" value={extension} />
  <label for="nwc" class="font-bold">{$t("user.settings.nwc")}</label>

  <p class="text-secondary mb-1">
    {$t("user.settings.nwcDescription")}
  </p>

  <div class="flex flex-wrap justify-center gap-2">
    <a href={nwc} class="btn grow">
      <img src="/images/nostr.png" class="w-8" />
      <div class="my-auto">{$t("user.settings.connectNostr")}</div>
    </a>

    {#if !revealNwc}
      <button onclick={toggleNwc} type="button" class="btn grow">
        <iconify-icon noobserver icon="ph:warning-bold" width="32"
        ></iconify-icon>
        <div class="my-auto">{$t("accounts.revealNwc")}</div></button
      >
    {/if}
  </div>
</div>

{#if revealNwc}
  <div class="break-all grow">
    {nwc}
  </div>
  <div class="flex flex-wrap gap-2">
    <button onclick={() => copy(nwc)} type="button" class="btn grow">
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("accounts.copy")}</div></button
    >
    <a href={`/qr/${encodeURIComponent(nwc)}`} class="btn grow">
      <iconify-icon noobserver icon="ph:qr-code-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("user.receive.showQR")}</div>
    </a>
  </div>
{/if}

<div class="space-y-2">
  <div class="font-bold">{$t("user.nostrPubkey")}</div>
  <div class="flex gap-4">
    <textarea name="pubkey" bind:value={npub}> </textarea>
    <div class="flex my-auto gap-1">
      <button type="button" class="my-auto" onclick={() => copy(npub)}
        ><iconify-icon noobserver icon="ph:copy-bold" width="32"
        ></iconify-icon></button
      >
      <a href={`/qr/${encodeURIComponent(npub)}`} class="my-auto">
        <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
        ></iconify-icon>
      </a>
    </div>
  </div>

  {#if extensionAvailable}
    <button class="btn" type="button" onclick={getPubkey}>
      <iconify-icon icon="lucide-lab:bee" width="32" class="text-yellow-400"
      ></iconify-icon>
      {$t("user.settings.syncWithExtension")}</button
    >
  {/if}
</div>

{#if user.nsec}
  <div class="space-y-2">
    <label for="seedphrase" class="font-bold"
      >{$t("user.settings.nostrKeys")}</label
    >

    <p class="text-secondary mb-1">
      {$t("user.settings.nostrDescription")}
    </p>

    <div class="flex flex-wrap sm:flex-nowrap gap-2">
      <button type="button" class="btn !w-auto flex-grow" onclick={toggleNsec}>
        {#if revealNsec}
          <iconify-icon noobserver icon="ph:eye-slash-bold" width="32"
          ></iconify-icon>
          {$t("user.settings.hideNsec")}
        {:else}
          <iconify-icon noobserver icon="ph:warning-bold" width="32"
          ></iconify-icon>
          {$t("user.settings.revealNsec")}
        {/if}
      </button>
    </div>

    {#if revealNsec}
      <button
        type="button"
        class="btn break-all !h-auto font-normal leading-normal flex-nowrap"
        onclick={() => copy(nsec)}
      >
        <div>{nsec}</div>

        <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      </button>
    {/if}
  </div>
{/if}
