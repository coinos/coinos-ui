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
  } from "$lib/passwordCache";

  let { data } = $props();
  let { user } = data;

  let hasMasterSeed = $derived(!!user.seed);

  let privateKey = $state("");
  let arkAddress = $state("");
  let nsec = $state("");
  let showNsec = $state(false);
  let confirmed = $state(false);
  let submitting = $state(false);

  let password = $state("");
  let confirm = $state("");
  let revealPassword = $state(false);
  let revealConfirm = $state(false);
  let rememberForMs = $state(defaultRememberForMs);

  let name = "Ark Vault";
  let type = "ark";

  onMount(async () => {
    if (hasMasterSeed) {
      // Try cached password first
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
      fail("Invalid password");
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
    if (hasMasterSeed) {
      if (!password) {
        fail("Password required");
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
      fail("Please backup your key first");
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
    <h1 class="text-3xl font-semibold">Create Ark Wallet</h1>
  </div>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if hasMasterSeed}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          Your Ark wallet will be derived from your master seed. Enter your wallet password to
          continue.
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
              placeholder="Wallet password"
            />
          {:else}
            <input
              use:focus
              name="password"
              type="password"
              placeholder="Wallet password"
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
          <label for="rememberFor" class="text-sm text-secondary"> Remember for </label>
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
          <a href={`/${user.username}`} class="contents">
            <button type="button" class="btn !w-auto grow"> Back </button>
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
          Your Ark wallet is secured by a private key. Please copy it down somewhere safe.
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
              I've backed it up
            </button>
          </div>
        {:else}
          <button type="button" class="btn btn-warning w-full" onclick={revealNsec}>
            <iconify-icon noobserver icon="ph:eye-bold" width="24"></iconify-icon>
            Reveal backup key
          </button>
        {/if}
      </div>
    {:else}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          Set a password to encrypt your key. You'll need this password to send funds.
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
              placeholder="Password"
            />
          {:else}
            <input
              use:focus
              name="password"
              type="password"
              placeholder="Password"
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
              placeholder="Confirm password"
              required
              bind:value={confirm}
              autocapitalize="none"
              class="clean"
            />
          {:else}
            <input
              type="password"
              placeholder="Confirm password"
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
          <label for="rememberFor" class="text-sm text-secondary"> Remember for </label>
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
          <button type="button" class="btn !w-auto grow" onclick={() => (confirmed = false)}>
            Back
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
