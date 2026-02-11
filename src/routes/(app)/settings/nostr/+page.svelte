<script lang="ts">
  import { untrack } from "svelte";
  import { browser } from "$app/environment";
  import { getNsec } from "$lib/nostr";
  import { page } from "$app/stores";
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { s, f, sats, copy, fail } from "$lib/utils";
  import {
    PUBLIC_COINOS_PUBKEY as pk,
    PUBLIC_COINOS_RELAY as relay,
  } from "$env/static/public";
  import { fiat, rate, signer, save } from "$lib/store";
  import { getPreferredRelays } from "$lib/nip17";

  let { data } = $props();
  let { apps, challenge, user } = $derived(data);
  let npub = $state(untrack(() => user.npub));
  let extensionAvailable = $derived(browser && window.nostr);
  let { locale } = $derived(user);

  import { SimplePool } from 'nostr-tools/pool';

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

  let extension = $state();
  let getPubkey = async () => {
    $signer = { method: "extension", ready: true };
    extension = true;
    npub = await window.nostr.getPublicKey();
    await tick();
    $save.click();
  };

  import { PUBLIC_DM_RELAYS } from '$env/static/public';
  const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');
  const pool = new SimplePool();
  getPreferredRelays(user.pubkey).then(relays => {
    const relayEntry = document.getElementById('dmRelays');
    relayEntry.value = relays.join("\n");
  });
</script>

<input type="hidden" name="challenge" value={challenge} />
<input type="hidden" name="extension" value={extension} />

<div>
  <h2 class="text-2xl font-bold mb-2">
    {$t("user.settings.nwc")}
  </h2>
  <p class="text-secondary mb-4">
    {$t("user.settings.nwcDescription")}
  </p>

  <div class="space-y-2">
    {#each apps as app, i}
      {@const last = i === apps.length - 1}
      <div class:border-b-8={!last} class="pb-4">
        <div class="flex justify-center gap-2 p-4">
          <div class="grow text-xl break-words min-w-0">
            <div>{app.name}</div>
            {#if app.max_amount > 0}
              <div class="flex gap-1 text-base">
                <div class="flex items-center">
                  <iconify-icon
                    noobserver
                    icon="ph:lightning-fill"
                    class="text-yellow-300"
                  ></iconify-icon>
                  {#if $fiat && $rate}
                    {f((app.spent * $rate) / sats, user.currency, locale)} /
                    {f((app.max_amount * $rate) / sats, user.currency, locale)}
                  {:else}
                    {s(app.spent, locale)} /
                    {s(app.max_amount, locale)}
                  {/if}
                </div>

                {#if app.budget_renewal !== "never"}
                  <div>
                    {app.budget_renewal}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <a
            href={`/apps/${app.pubkey}`}
            aria-label={$t("accounts.edit")}
            title={$t("accounts.edit")}
          >
            <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
          </a>

          <a
            href={`/apps/${app.pubkey}/payments`}
            aria-label={$t("accounts.payments")}
            class:btn-disabled={!app.secret}
            title={$t("accounts.payments")}
          >
            <iconify-icon icon="ph:clock-bold" width="32"></iconify-icon>
          </a>

          <a
            aria-label="QR"
            href={`/qr/${encodeURIComponent(app.nwc)}`}
            class:btn-disabled={!app.secret}
            title={$t("user.receive.showQR")}
            disabled={!app.secret}
          >
            <iconify-icon icon="ph:qr-code-bold" width="32"></iconify-icon>
          </a>
        </div>

        <div class="flex gap-1 w-full"></div>

        <div class="flex flex-wrap justify-center gap-1">
          <button
            aria-label="Copy"
            type="button"
            onclick={() => copy(app.nwc)}
            class="btn !w-auto grow"
            class:btn-disabled={!app.secret}
            title={$t("accounts.copy")}
          >
            <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
            <div>{$t("accounts.copyNwc")}</div>
          </button>
          <a
            href={app.nwc}
            class="btn bg-gradient-to-tr from-purple-500 to-pink-500 !w-auto text-white grow whitespace-nowrap"
            class:btn-disabled={!app.secret}
            aria-label="Open nostr"
          >
            <iconify-icon icon="ph:arrow-square-out-bold" width="32"
            ></iconify-icon>
            <div>{$t("accounts.connect")}</div>
          </a>
        </div>
      </div>
    {/each}

    <a href="/apps/new" class="btn">
      <iconify-icon icon="ph:plus-bold" width="32"></iconify-icon>
      {$t("accounts.newConection")}
    </a>
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
  <textarea name="pubkey" bind:value={npub} rows={3}></textarea>
  <div>
  <div class="flex my-auto gap-1">
    <button
      type="button"
      class="my-auto btn btn-circle !w-auto grow"
      onclick={() => copy(npub)}
      aria-label="Copy"
      ><iconify-icon noobserver icon="ph:copy-bold" width="32"
      ></iconify-icon> {$t("accounts.copy")}</button
    >

    <a
      href={`/qr/${encodeURIComponent(npub)}`}
      class="my-auto btn btn-circle !w-auto grow"
      aria-label="QR"
    >
      <iconify-icon noobserver icon="ph:qr-code-bold" width="32"></iconify-icon>
{$t("accounts.qr")}
    </a>
    </div>
  </div>

  {#if extensionAvailable}
    <button class="btn" type="button" onclick={getPubkey}>
      <img src="/images/alby.svg" width="32" alt="Alby" />
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

<span class="font-bold" id="dm-relays">
    {$t("user.settings.preferredDM")}
</span>
<p class="text-secondary mb-1">
    {$t("user.settings.preferredDMDescription")}
</p>

<textarea id="dmRelays" name="dmRelays" rows={3}></textarea>
