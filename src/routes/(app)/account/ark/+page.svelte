<script lang="ts">
  import { preventDefault } from "svelte/legacy";
  import { tick, onMount } from "svelte";
  import { t } from "$lib/translations";
  import Spinner from "$comp/Spinner.svelte";
  import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";
  import { hex } from "@scure/base";
  import { focus, fail, post, copy, versions } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { arkServerUrl } from "$lib/ark";
  import { HDKey } from "@scure/bip32";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import {
    rememberForOptions,
    defaultRememberForMs,
    rememberWalletPassword,
    forgetWalletPassword,
    getRememberedWalletPassword,
    getCachedPrfKey,
    rememberPrfKey,
  } from "$lib/passwordCache";
  import { loginWithPasskey } from "$lib/passkey";

  let { data } = $props();
  let user = $derived(data.user);

  let hasMasterSeed = $derived(!!user.seed);
  let hasPrfSeed = $state(!!getCachedPrfKey());
  let hasSigner = $state(false);

  let privateKey = $state("");
  let arkAddress = $state("");
  let nsec = $state("");
  let showNsec = $state(false);
  let confirmed = $state(false);
  let submitting = $state(false);
  let needsPasskeyUnlock = $state(false);

  let password = $state("");
  let confirm = $state("");
  let revealPassword = $state(false);
  let revealConfirm = $state(false);
  let rememberForMs = $state(defaultRememberForMs);

  let name = $t("accounts.savings");
  let type = "ark";

  let deriveFromPrfKey = async (prfKey: ArrayBuffer) => {
    try {
      const { SingleKey, Wallet } = await import("@arkade-os/sdk");
      const entropy = new Uint8Array(prfKey);
      const mnemonic = entropyToMnemonic(entropy, wordlist);
      const seed = await mnemonicToSeed(mnemonic);
      const master = HDKey.fromMasterSeed(seed, versions);
      const arkChild = master.derive("m/86'/0'/0'/0/0");
      const arkHex = bytesToHex(arkChild.privateKey!);
      const identity = SingleKey.fromHex(arkHex);
      const wallet = await Wallet.create({ identity, arkServerUrl });
      arkAddress = await wallet.getAddress();
      confirmed = true;
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
    } else if (hasMasterSeed) {
      const cached = getRememberedWalletPassword();
      if (cached) {
        password = cached;
        confirm = cached;
        await deriveFromMasterSeed(cached);
      }
    } else {
      await generateKey();
    }
  });

  let deriveFromMasterSeed = async (pw) => {
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      const { SingleKey, Wallet } = await import("@arkade-os/sdk");
      let entropy = await decrypt(user.seed, pw);
      let mnemonic = entropyToMnemonic(entropy, wordlist);
      let seed = await mnemonicToSeed(mnemonic, pw);
      let master = HDKey.fromMasterSeed(seed, versions);
      let arkChild = master.derive("m/86'/0'/0'/0/0");
      let arkHex = bytesToHex(arkChild.privateKey!);
      const identity = SingleKey.fromHex(arkHex);
      const wallet = await Wallet.create({ identity, arkServerUrl });
      arkAddress = await wallet.getAddress();
      confirmed = true;
    } catch (e: any) {
      console.log("master seed derivation failed", e);
      fail($t("accounts.invalidPassword"));
    }
  };

  let generateKey = async () => {
    const { nip19 } = await import("nostr-tools");
    const { SingleKey, Wallet } = await import("@arkade-os/sdk");
    privateKey = bytesToHex(randomBytes(32));
    nsec = nip19.nsecEncode(hex.decode(privateKey));
    showNsec = false;
    confirmed = false;

    const identity = SingleKey.fromHex(privateKey);
    const wallet = await Wallet.create({ identity, arkServerUrl });
    arkAddress = await wallet.getAddress();
  };

  let revealNsec = () => {
    showNsec = true;
  };

  let confirmBackup = () => {
    confirmed = true;
  };

  let submit = async () => {
    if (hasPrfSeed) {
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
      return;
    }

    if (hasMasterSeed) {
      if (!password) {
        fail($t("accounts.passwordRequired"));
        return;
      }

      submitting = true;
      await tick();

      try {
        if (!arkAddress) await deriveFromMasterSeed(password);
        await post("/account", { name, type, arkAddress });
        if (rememberForMs) {
          rememberWalletPassword(password, rememberForMs);
        } else {
          forgetWalletPassword();
        }
        goto(`/${user.username}`);
      } catch (e: any) {
        console.log(e);
        fail(e.message);
      }

      submitting = false;
      return;
    }

    if (!confirmed) {
      fail($t("accounts.pleaseBackupFirst"));
      return;
    }

    if (!password || password !== confirm) {
      fail($t("accounts.passwordMismatch"));
      return;
    }

    submitting = true;
    await tick();

    try {
      const { encrypt } = await import("nostr-tools/nip49");
      let seed = await encrypt(hex.decode(privateKey), password);

      await post("/account", { name, seed, type, arkAddress });
      if (rememberForMs) {
        rememberWalletPassword(password, rememberForMs);
      } else {
        forgetWalletPassword();
      }
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
    {#if hasPrfSeed}
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
    {:else if hasMasterSeed}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          {$t("accounts.arkEnterPassword")}
        </p>

        <label for="password" class="input flex items-center justify-center gap-2 w-full">
          {#if revealPassword}
            <input
              name="password"
              type="text"
              required
              bind:value={password}
              autocapitalize="none"
              class="clean"
              placeholder={$t("payments.enterWalletPass")}
            />
          {:else}
            <input
              use:focus
              name="password"
              type="password"
              placeholder={$t("payments.enterWalletPass")}
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

        <div class="space-y-2">
          <label for="rememberFor" class="text-sm text-secondary">{$t("user.settings.rememberFor")}</label>
          <select
            id="rememberFor"
            class="w-full"
            value={rememberForMs}
            onchange={(e) => (rememberForMs = Number((e.target as HTMLSelectElement).value))}
          >
            {#each rememberForOptions as option}
              <option value={option.ms}>{$t(option.label)}</option>
            {/each}
          </select>
        </div>

        <div class="flex gap-2">
          <a href={`/${user.username}`} class="contents">
            <button type="button" class="btn !w-auto grow">Back</button>
          </a>
          <button disabled={submitting} type="submit" class="btn btn-accent !w-auto grow">
            {#if submitting}
              <Spinner />
            {:else}
              Create Wallet
            {/if}
          </button>
        </div>
      </form>
    {:else if !confirmed}
      <div class="space-y-4">
        <p class="text-secondary">
          {$t("accounts.arkSecuredByKey")}
        </p>

        {#if showNsec}
          <div class="space-y-2">
            <button
              type="button"
              class="break-all p-4 rounded-lg cursor-pointer border text-left w-full"
              onclick={() => copy(nsec)}
              aria-label="Copy backup key"
            >
              {nsec}
            </button>
          </div>

          <div class="flex gap-2">
            <button type="button" class="btn btn-accent flex-grow" onclick={confirmBackup}>
              <iconify-icon noobserver icon="ph:check-bold" width="24"></iconify-icon>
              {$t("accounts.backedItUp")}
            </button>
          </div>
        {:else}
          <button type="button" class="btn btn-warning w-full" onclick={revealNsec}>
            <iconify-icon noobserver icon="ph:eye-bold" width="24"></iconify-icon>
            {$t("accounts.revealBackupKey")}
          </button>
        {/if}
      </div>
    {:else}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          {$t("accounts.setPasswordToEncrypt")}
        </p>

        <label for="password" class="input flex items-center justify-center gap-2 w-full">
          {#if revealPassword}
            <input
              name="password"
              type="text"
              required
              bind:value={password}
              autocapitalize="none"
              class="clean"
              placeholder={$t("accounts.password")}
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

        <label for="confirm" class="input flex items-center justify-center gap-2 w-full">
          {#if revealConfirm}
            <input
              name="confirm"
              type="text"
              placeholder={$t("accounts.confirmPassword")}
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
          <label for="rememberFor" class="text-sm text-secondary">{$t("user.settings.rememberFor")}</label>
          <select
            id="rememberFor"
            class="w-full"
            value={rememberForMs}
            onchange={(e) => (rememberForMs = Number((e.target as HTMLSelectElement).value))}
          >
            {#each rememberForOptions as option}
              <option value={option.ms}>{$t(option.label)}</option>
            {/each}
          </select>
        </div>

        <div class="flex gap-2">
          <button type="button" class="btn !w-auto grow" onclick={() => (confirmed = false)}>
            {$t("accounts.back")}
          </button>
          <button disabled={submitting} type="submit" class="btn btn-accent !w-auto grow">
            {#if submitting}
              <Spinner />
            {:else}
              Create Wallet
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
