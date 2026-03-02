<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "$lib/translations";
  import Spinner from "$comp/Spinner.svelte";
  import { bytesToHex } from "@noble/hashes/utils.js";
  import { fail, post, versions } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { arkServerUrl } from "$lib/ark";
  import { HDKey } from "@scure/bip32";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import {
    defaultRememberForMs,
    getCachedPrfKey,
    rememberPrfKey,
  } from "$lib/passwordCache";
  import { loginWithPasskey } from "$lib/passkey";

  let { data } = $props();
  let user = $derived(data.user);

  let hasPrfSeed = $state(!!getCachedPrfKey());
  let hasSigner = $state(false);

  let arkAddress = $state("");
  let submitting = $state(true);
  let needsPasskeyUnlock = $state(false);

  let name = $t("accounts.savings");
  let type = "ark";

  let deriveAndCreate = async (prfKey: ArrayBuffer) => {
    try {
      const { SingleKey, Wallet } = await import("@arkade-os/sdk");
      const entropy = new Uint8Array(prfKey).slice(0, 16);
      const mnemonic = entropyToMnemonic(entropy, wordlist);
      const seed = await mnemonicToSeed(mnemonic);
      const master = HDKey.fromMasterSeed(seed, versions);
      const arkChild = master.derive("m/86'/0'/0'/0/0");
      const arkHex = bytesToHex(arkChild.privateKey!);
      const identity = SingleKey.fromHex(arkHex);
      const wallet = await Wallet.create({ identity, arkServerUrl });
      arkAddress = await wallet.getAddress();
      await post("/account", { name, type, arkAddress });
      goto(`/${user.username}`);
    } catch (e: any) {
      console.log("Ark account creation failed", e);
      fail(e.message || $t("accounts.failedToDecryptSeed"));
      submitting = false;
    }
  };

  let unlockWithNostr = async () => {
    try {
      submitting = true;
      const { deriveNostrEntropy } = await import("$lib/walletEntropy");
      const entropy = await deriveNostrEntropy();
      await deriveAndCreate(entropy);
    } catch (e: any) {
      fail(e.message || $t("accounts.passkeyUnlockFailed"));
      submitting = false;
    }
  };

  let unlockWithPasskey = async () => {
    try {
      submitting = true;
      const { prfKey } = await loginWithPasskey();
      if (prfKey) {
        rememberPrfKey(prfKey, defaultRememberForMs);
        await deriveAndCreate(prfKey);
      } else {
        fail($t("accounts.passkeyNoPrf"));
        submitting = false;
      }
    } catch (e: any) {
      if (e.name !== "NotAllowedError") {
        fail(e.message || $t("accounts.passkeyUnlockFailed"));
      }
      submitting = false;
    }
  };

  onMount(async () => {
    submitting = true;
    hasSigner = !!localStorage.getItem("signer");

    // Try wallet entropy (covers cached prfKey, nsec, and client-side password)
    const { getWalletEntropy } = await import("$lib/walletEntropy");
    const entropy = await getWalletEntropy();
    if (entropy) {
      await deriveAndCreate(entropy);
      return;
    }

    // Need manual unlock
    submitting = false;
    needsPasskeyUnlock = true;
  });
</script>

<div class="space-y-5">
  <div class="flex items-center justify-center gap-2">
    <h1 class="text-3xl font-semibold">{$t("accounts.createSavingsAccount")}</h1>
  </div>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if submitting}
      <div class="flex justify-center py-8">
        <Spinner class="text-gray-400" />
      </div>
    {:else if needsPasskeyUnlock}
      <div class="space-y-5">
        <p class="text-secondary">
          {$t("accounts.arkUnlockWithPasskey")}
        </p>
        {#if hasSigner}
          <button type="button" class="btn btn-accent" onclick={unlockWithNostr}>
            <img src="/images/nostr.png" class="w-6" alt="Nostr" />
            {$t("accounts.unlockWithNostr")}
          </button>
        {/if}
        <button type="button" class="btn btn-accent" onclick={unlockWithPasskey}>
          <iconify-icon noobserver icon="ph:fingerprint-bold" width="24"></iconify-icon>
          {$t("accounts.unlockWithPasskey")}
        </button>
        <a href={`/${user.username}`}>
          <button type="button" class="btn">{$t("accounts.back")}</button>
        </a>
      </div>
    {/if}
  </div>
</div>
