<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import Icon from "$comp/Icon.svelte";
  import { encrypt } from "nostr-tools/nip49";
  import {
    mnemonicToSeed,
    mnemonicToEntropy,
    entropyToMnemonic,
  } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";
  import { focus, versions, fail, post } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { HDKey } from "@scure/bip32";

  export let data;

  let { user } = data;

  let confirm, password, revealPassword, revealConfirm;
      let type = "bitcoin";

  onMount(() => {
    if (!$mnemonic) goto("/account/savings");
  });

  let submit = async () => {
    if (!password || password !== confirm) {
      fail("Passwords don't match");
      return;
    }

    try {
      let seed = await encrypt(
        mnemonicToEntropy($mnemonic, wordlist),
        password
      );
      let master = HDKey.fromMasterSeed(
        await mnemonicToSeed($mnemonic, password),
        versions
      );
      let child = master.derive("m/84'/0'/0'");
      let pubkey = child.publicExtendedKey;
      let fingerprint = child.fingerprint.toString(16).padStart(8, "0");

      let receiving = child.deriveChild(0);
      await post("/api/accounts", { fingerprint, pubkey, seed, type });
      goto(`/${user.username}`);
    } catch (e) {
      console.log(e);
      fail(e.message);
    }

    $mnemonic = "";
  };
</script>

<div class="space-y-5">
  <div>
    <h1 class="text-center text-3xl font-semibold">Account password</h1>
  </div>

  <form
    on:submit|preventDefault={submit}
    class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5"
  >
    <p class="text-secondary mb-1">
      If you lose this password you won't be able to use the account. We can't
      recover it for you even if you have the seed phrase.
    </p>

    <div class="relative">
      {#if revealPassword}
        <input
          name="password"
          type="text"
          required
          bind:value={password}
          autocapitalize="none"
        />
      {:else}
        <input
          use:focus
          name="password"
          type="password"
          required
          bind:value={password}
          autocapitalize="none"
        />
      {/if}
      <button
        type="button"
        on:click={() => (revealPassword = !revealPassword)}
        class="absolute right-5 -translate-y-1/2 top-1/2"
      >
        <Icon icon={revealPassword ? "eye" : "eye-off"} />
      </button>
    </div>

    <div class="relative">
      {#if revealConfirm}
        <input
          name="password"
          type="text"
          placeholder="Confirm password"
          required
          bind:value={confirm}
          autocapitalize="none"
        />
      {:else}
        <input
          name="password"
          type="password"
          placeholder="Confirm password"
          required
          bind:value={confirm}
          autocapitalize="none"
        />
      {/if}
      <button
        type="button"
        on:click={() => (revealConfirm = !revealConfirm)}
        class="absolute right-5 -translate-y-1/2 top-1/2"
      >
        <Icon icon={revealConfirm ? "eye" : "eye-off"} />
      </button>
    </div>

    <button
      class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
    >
      Submit
    </button>
  </form>
</div>
