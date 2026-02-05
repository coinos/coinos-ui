<script>
  import { page } from "$app/stores";
  import Mnemonic from "$comp/Mnemonic.svelte";
  import WalletPass from "$comp/WalletPass.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import {
    getRememberedWalletPassword,
    forgetWalletPassword,
  } from "$lib/passwordCache";

  let { data } = $props();
  let { account, user } = data;
  let { id, seed } = account;
  let displayType = $derived(
    account.type === "ark"
      ? $t("accounts.ark")
      : seed
        ? $t("accounts.bitcoin")
        : $t("accounts.custodial"),
  );
  let name = $state(account.name || displayType);
  let mnemonic = $state(),
    password = $state();
  let passwordPrompt = $state();
  let cancel = $state(() => (passwordPrompt = false));
  let toggle = () => (passwordPrompt = !passwordPrompt);

  let revealWithCachedPassword = async () => {
    const cached = getRememberedWalletPassword();
    if (!cached) return false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      let entropy = await decrypt(seed, cached);
      mnemonic = entropyToMnemonic(entropy, wordlist);
      password = cached;
      return true;
    } catch (e) {
      forgetWalletPassword();
      return false;
    }
  };

  let requestMnemonic = async () => {
    if (await revealWithCachedPassword()) return;
    toggle();
  };

  let submit = $state(async () => {
    passwordPrompt = false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      let entropy = await decrypt(seed, password);
      mnemonic = entropyToMnemonic(entropy, wordlist);
    } catch (e) {
      fail("Invalid password, try again");
      passwordPrompt = true;
    }
  });

  let del = async () => {
    try {
      await post("/api/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e) {
      fail(e.message);
    }
  };

</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">
    {$t("payments.accountSettings")}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST" use:enhance>
      <div class="space-y-1">
        <label for="name" class="font-bold block">{$t("accounts.name")}</label>
        <label
          class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
        >
          <input type="text" name="name" class="clean" bind:value={name} />
        </label>
      </div>

      <div class="space-y-2">
        {#if mnemonic}
          <Mnemonic {mnemonic} />

          <button onclick={() => copy(mnemonic)} type="button" class="btn">
            <iconify-icon noobserver icon="ph:copy-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.copy")}</div></button
          >
        {:else if seed}
          <button onclick={requestMnemonic} type="button" class="btn">
            <iconify-icon noobserver icon="ph:eye-bold" width="32"
            ></iconify-icon>
            <div class="my-auto">{$t("accounts.revealMnemonic")}</div></button
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

      <button type="submit" class="btn btn-accent !w-full">
        <div class="my-auto">{$t("accounts.submit")}</div>
      </button>
    </form>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel bind:submit />
{/if}
