<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { tick, onMount } from "svelte";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import Spinner from "$comp/Spinner.svelte";
  import {
    mnemonicToSeed,
    mnemonicToEntropy,
    entropyToMnemonic,
  } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { focus, versions, fail, post } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { HDKey } from "@scure/bip32";
  import {
    rememberForOptions,
    defaultRememberForMs,
    rememberWalletPassword,
    forgetWalletPassword,
  } from "$lib/passwordCache";

  let { data }: any = $props();

  let { user } = data;
  let submitting = $state(false);

  let confirm: string = $state(""),
    password: string = $state(""),
    revealPassword = $state(),
    revealConfirm = $state();
  let rememberForMs = $state(defaultRememberForMs);

  onMount(() => {
    if (!$mnemonic) goto("/account/new");
  });

  let submit = async () => {
    submitting = true;
    await tick();
    if (!password || password !== confirm) {
      fail($t("accounts.passwordMismatch"));
      return;
    }

    try {
      const { encrypt } = await import("nostr-tools/nip49");
      let seed = await encrypt(
        mnemonicToEntropy($mnemonic as string, wordlist),
        password,
      );

      // Save master seed on user
      await post("/post/user", { seed });

      let master = HDKey.fromMasterSeed(
        await mnemonicToSeed($mnemonic as string, password),
        versions,
      );

      // Bitcoin account at m/84'/0'/0'
      let child = master.derive("m/84'/0'/0'");
      let pubkey = child.publicExtendedKey;
      let fingerprint = child.fingerprint.toString(16).padStart(8, "0");
      await post("/account", {
        fingerprint,
        pubkey,
        name: $t("accounts.savings"),
        type: "bitcoin",
        accountIndex: 0,
      });

      if (rememberForMs) {
        rememberWalletPassword(password, rememberForMs);
      } else {
        forgetWalletPassword();
      }
      $mnemonic = "";
      goto(`/${user.username}`);
    } catch (e: any) {
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
    <p class="text-secondary p-4 bg-warning/80 rounded-2xl border-warning border-2">
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

      <button
        type="button"
        class="ml-auto"
        aria-label="Toggle password visibility"
        onclick={() => (revealPassword = !revealPassword)}
      >
        <iconify-icon
          noobserver
          icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
          width="32"
        ></iconify-icon>
      </button>
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
      <button
        type="button"
        class="ml-auto"
        aria-label="Toggle confirmation visibility"
        onclick={() => (revealConfirm = !revealConfirm)}
      >
        <iconify-icon
          noobserver
          icon={revealConfirm ? "ph:eye-bold" : "ph:eye-slash-bold"}
          width="32"
        ></iconify-icon>
      </button>
    </label>

    <div class="space-y-2">
      <label for="rememberFor" class="text-sm text-secondary">
        Remember for
      </label>
      <select
        id="rememberFor"
        class="w-full"
        value={rememberForMs}
        onchange={(e) => (rememberForMs = Number((e.target as HTMLSelectElement).value))}
      >
        {#each rememberForOptions as option}
          <option value={option.ms}>{option.label}</option>
        {/each}
      </select>
    </div>

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
