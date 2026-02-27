<script lang="ts">
  import { preventDefault } from "svelte/legacy";
  import { tick, onMount } from "svelte";
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
  let submitting = $state(false);
  let needsPasskeyUnlock = $state(false);

  let name = $t("accounts.savings");
  let type = "ark";

  let deriveFromPrfKey = async (prfKey: ArrayBuffer) => {
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
    } catch (e: any) {
      console.log("PRF seed derivation failed", e);
      fail($t("accounts.failedToDecryptSeed"));
    }
  };

  let unlockWithNostr = async () => {
    try {
      const { deriveNostrEntropy } = await import("$lib/walletEntropy");
      const entropy = await deriveNostrEntropy();
      hasPrfSeed = true;
      await deriveFromPrfKey(entropy);
      needsPasskeyUnlock = false;
    } catch (e: any) {
      fail(e.message || $t("accounts.passkeyUnlockFailed"));
    }
  };

  let unlockWithPasskey = async () => {
    try {
      const { prfKey } = await loginWithPasskey();
      if (prfKey) {
        rememberPrfKey(prfKey, defaultRememberForMs);
        await deriveFromPrfKey(prfKey);
        needsPasskeyUnlock = false;
      } else {
        fail($t("accounts.passkeyNoPrf"));
      }
    } catch (e: any) {
      if (e.name !== "NotAllowedError") {
        fail(e.message || $t("accounts.passkeyUnlockFailed"));
      }
    }
  };

  onMount(async () => {
    hasSigner = !!localStorage.getItem("signer");

    // Try wallet entropy (covers both cached prfKey and silent nsec derivation)
    if (!hasPrfSeed) {
      const { getWalletEntropy } = await import("$lib/walletEntropy");
      const entropy = await getWalletEntropy();
      if (entropy) {
        hasPrfSeed = true;
        await deriveFromPrfKey(entropy);
        return;
      }
    }

    if (hasPrfSeed) {
      const prfKey = getCachedPrfKey();
      if (prfKey) {
        await deriveFromPrfKey(prfKey);
      } else {
        needsPasskeyUnlock = true;
      }
    } else {
      needsPasskeyUnlock = true;
    }
  });

  let submit = async () => {
    submitting = true;
    await tick();
    try {
      if (!arkAddress) {
        const prfKey = getCachedPrfKey();
        if (prfKey) await deriveFromPrfKey(prfKey);
        else throw new Error("PRF key not available");
      }
      await post("/account", { name, type, arkAddress });
      goto(`/${user.username}`);
    } catch (e: any) {
      console.log(e);
      fail(e.message);
    }
    submitting = false;
  };
</script>

<div class="space-y-5">
  <div class="flex items-center justify-center gap-2">
    <h1 class="text-3xl font-semibold">{$t("accounts.createSavingsAccount")}</h1>
  </div>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if needsPasskeyUnlock}
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
      </div>
    {:else}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          {$t("accounts.arkDerivedFromPasskey")}
        </p>
        <div class="flex gap-2">
          <a href={`/${user.username}`} class="contents">
            <button type="button" class="btn !w-auto grow">{$t("accounts.back")}</button>
          </a>
          <button disabled={submitting} type="submit" class="btn btn-accent !w-auto grow">
            {#if submitting}
              <Spinner />
            {:else}
              {$t("accounts.createWallet")}
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
