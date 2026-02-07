<script>
  import { page } from "$app/stores";
  import Mnemonic from "$comp/Mnemonic.svelte";
  import WalletPass from "$comp/WalletPass.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import { decrypt } from "nostr-tools/nip49";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import {
    PUBLIC_COINOS_PUBKEY as pk,
    PUBLIC_COINOS_RELAY as relay,
  } from "$env/static/public";

  let { data } = $props();
  let { account, user } = data;
  let { id, name, seed } = account;
  let mnemonic = $state(),
    password = $state();
  let passwordPrompt = $state();
  let cancel = $state(() => (passwordPrompt = false));
  let toggle = () => (passwordPrompt = !passwordPrompt);

  let lud16 = $derived(`${user.username}@${$page.url.host}`);

  let submit = $state(async () => {
    toggle();
    let entropy = await decrypt(seed, password);
    mnemonic = entropyToMnemonic(entropy, wordlist);
  });

  let del = async () => {
    try {
      await post("/api/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e) {
      fail(e.message);
    }
  };

  let nwc = $state();
  let revealNwc = () =>
    (nwc = `nostr+walletconnect://${pk}?relay=${encodeURIComponent(
      relay,
    )}&secret=${user.nwc}&lud16=${lud16}`);
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">
    {$t("payments.accountSettings")}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST">
      <div class="space-y-2">
        {#if mnemonic}
          <Mnemonic {mnemonic} />

          <button onclick={() => copy(mnemonic)} type="button" class="btn">
            <iconify-icon noobserver icon="ph:copy-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.copy")}</div></button
          >
        {:else if seed}
          <button onclick={toggle} type="button" class="btn">
            <iconify-icon noobserver icon="ph:eye-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.revealMnemonic")}</div></button
          >
        {:else if nwc}
          <div class="break-all grow text-xl">
            {nwc}
          </div>
          <button onclick={() => copy(nwc)} type="button" class="btn">
            <iconify-icon noobserver icon="ph:copy-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.copy")}</div></button
          >
          <a href={`/qr/${encodeURIComponent(nwc)}`} class="my-auto block">
            <button onclick={() => copy(nwc)} type="button" class="btn">
              <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
              ></iconify-icon>
              <div class="my-auto">{$t("user.receive.showQR")}</div></button
            >
          </a>
        {:else}
          <button onclick={revealNwc} type="button" class="btn">
            <iconify-icon noobserver icon="ph:eye-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.revealNwc")}</div></button
          >
        {/if}

        {#if seed}
          <button onclick={del} type="button" class="btn">
            <iconify-icon noobserver icon="ph:trash-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.deleteAccount")}</div></button
          >
        {/if}
      </div>

      <div></div>
    </form>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel bind:submit />
{/if}
