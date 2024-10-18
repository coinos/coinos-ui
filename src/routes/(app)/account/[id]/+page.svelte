<script>
  import Mnemonic from "$comp/Mnemonic.svelte";
  import WalletPass from "$comp/WalletPass.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { decrypt } from "nostr-tools/nip49";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";
  import {
    PUBLIC_COINOS_PUBKEY as pk,
    PUBLIC_COINOS_RELAY as relay,
  } from "$env/static/public";

  export let data;
  let { account, user } = data;
  let { id, name, seed } = account;
  let mnemonic, password;
  let passwordPrompt;
  let cancel = () => (passwordPrompt = false);
  let toggle = () => (passwordPrompt = !passwordPrompt);

  let submit = async () => {
    toggle();
    let entropy = await decrypt(seed, password);
    mnemonic = entropyToMnemonic(entropy, wordlist);
  };

  let del = async () => {
    try {
      await post("/api/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e) {
      fail(e.message);
    }
  };

  let nwc;
  let revealNwc = () =>
    (nwc = `nostr+walletconnect://${pk}?relay=${encodeURIComponent(
      relay,
    )}&secret=${user.nwc}`);
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Account settings</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST">
      <div class="space-y-2">
        {#if mnemonic}
          <Mnemonic {mnemonic} />

          <button
            on:click={() => copy(mnemonic)}
            type="button"
            class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
          >
            <Icon icon="copy" style="w-8 my-auto" />
            <div class="my-auto">{$t("accounts.copy")}</div></button
          >
        {:else if seed}
          <button
            on:click={toggle}
            type="button"
            class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
          >
            <Icon icon="eye" style="w-8 my-auto" />
            <div class="my-auto">{$t("accounts.revealMnemonic")}</div></button
          >
        {:else if nwc}
          <div class="break-all grow text-xl">
            {nwc}
          </div>
          <button
            on:click={() => copy(nwc)}
            type="button"
            class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
          >
            <Icon icon="copy" style="w-8 my-auto" />
            <div class="my-auto">{$t("accounts.copy")}</div></button
          >
          <a href={`/qr/${encodeURIComponent(nwc)}`} class="my-auto block">
            <button
              on:click={() => copy(nwc)}
              type="button"
              class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
            >
              <Icon icon="qr" style="w-8 my-auto invert" />
              <div class="my-auto">{$t("user.receive.showQR")}</div></button
            >
          </a>
        {:else}
          <button
            on:click={revealNwc}
            type="button"
            class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
          >
            <Icon icon="eye" style="w-8 my-auto" />
            <div class="my-auto">{$t("accounts.revealNwc")}</div></button
          >
        {/if}

        {#if seed}
          <button
            on:click={del}
            type="button"
            class="flex gap-2 rounded-2xl border py-5 mx-auto px-6 w-full justify-center"
          >
            <Icon icon="trash" style="w-8 my-auto" />
            <div class="my-auto">{$t("accounts.deleteAccount")}</div></button
          >
        {/if}
      </div>

      <div />
    </form>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel bind:submit />
{/if}
