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

  let confirm, password;

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
      await post("/api/accounts", { fingerprint, pubkey, seed });
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
      Please add a password to the account. It should be different than your
      login password. <b class="text-red-700">We won't be able to reset it.</b> You'll
      need it to make withdrawals.
    </p>

    <input use:focus type="text" placeholder="Password" bind:value={password} />
    <input
      use:focus
      type="text"
      placeholder="Confirm password"
      bind:value={confirm}
    />

    <button
      class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
    >
      Submit
    </button>
  </form>
</div>
