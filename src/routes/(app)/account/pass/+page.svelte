<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { tick, onMount } from "svelte";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import Spinner from "$comp/Spinner.svelte";
  import { encrypt } from "nostr-tools/nip49";
  import {
    mnemonicToSeed,
    mnemonicToEntropy,
    entropyToMnemonic,
  } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { focus, versions, fail, post } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { HDKey } from "@scure/bip32";

  let { data } = $props();

  let { user } = data;
  let submitting = $state();

  let confirm = $state(),
    password = $state(),
    revealPassword = $state(),
    revealConfirm = $state();
  let type = "bitcoin";
  let name = $t("accounts.savings");

  onMount(() => {
    if (!$mnemonic) goto("/account/savings");
  });

  let submit = async () => {
    submitting = true;
    await tick();
    if (!password || password !== confirm) {
      fail($t("accounts.passwordMismatch"));
      return;
    }

    try {
      let seed = await encrypt(
        mnemonicToEntropy($mnemonic, wordlist),
        password,
      );

      let master = HDKey.fromMasterSeed(
        await mnemonicToSeed($mnemonic, password),
        versions,
      );

      let child = master.derive("m/84'/0'/0'");
      let pubkey = child.publicExtendedKey;
      let fingerprint = child.fingerprint.toString(16).padStart(8, "0");
      await post("/account", { fingerprint, pubkey, name, seed, type });
      $mnemonic = "";
      goto(`/${user.username}`);
    } catch (e) {
      console.log(e);
      fail(e.message);
    }

    submitting = false;
  };
</script>

<div class="space-y-5">
  <div>
    <h1 class="text-center text-3xl font-semibold">
      {$t("accounts.accountPassword")}
    </h1>
  </div>

  <form
    onsubmit={preventDefault(submit)}
    class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5"
  >
    <p class="text-secondary mb-1">
      {$t("accounts.passwordWarning")}
    </p>

    <label
      for="password"
      class="input flex items-center justify-center gap-2 w-full"
    >
      {#if revealPassword}
        <input
          name="password"
          type="text"
          required
          bind:value={password}
          autocapitalize="none"
          class="clean"
        />
      {:else}
        <input
          use:focus
          name="password"
          type="password"
          placeholder={$t("accounts.password")}
          required
          bind:value={password}
          autocapitalize="none"
          class="clean"
        />
      {/if}

      <iconify-icon noobserver
        class="cursor-pointer ml-auto"
        onclick={() => (revealPassword = !revealPassword)}
        icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
        width="32"
      ></iconify-icon>
    </label>

    <label
      for="confirm"
      class="input flex items-center justify-center gap-2 w-full"
    >
      {#if revealConfirm}
        <input
          name="confirm"
          type="text"
          placeholder="Confirm password"
          required
          bind:value={confirm}
          autocapitalize="none"
          class="clean"
        />
      {:else}
        <input
          type="password"
          placeholder={$t("accounts.confirmPassword")}
          required
          bind:value={confirm}
          autocapitalize="none"
          class="clean"
        />
      {/if}
      <iconify-icon noobserver
        class="cursor-pointer ml-auto"
        onclick={() => (revealConfirm = !revealConfirm)}
        icon={revealConfirm ? "ph:eye-bold" : "ph:eye-slash-bold"}
        width="32"
      ></iconify-icon>
    </label>

    <div class="flex gap-2">
      <a href={`/account/seed`} class="contents">
        <button type="button" class="btn !w-auto grow">
          {$t("accounts.back")}
        </button>
      </a>
      <button
        disabled={submitting}
        type="submit"
        class="btn btn-accent !w-auto grow"
      >
        {#if submitting}
          <Spinner />
        {:else}
          {$t("accounts.finish")}
        {/if}
      </button>
    </div>
  </form>
</div>
