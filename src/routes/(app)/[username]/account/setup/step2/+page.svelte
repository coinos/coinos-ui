<script lang="ts">
  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import Icon from "$comp/Icon.svelte";
  import { encrypt, decrypt } from "nostr-tools/nip49";
  import { mnemonicToEntropy, entropyToMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";
  import { fail, post } from "$lib/utils";
  import { goto } from "$app/navigation";

  export let data;
  let { user } = data;

  let password;

  let submit = async () => {
    let seed = await encrypt(mnemonicToEntropy($mnemonic, wordlist), password);
    try {
      await post("/api/accounts", { seed });
      goto(`/${user.username}`);
    } catch (e) {
      console.log(e);
      fail("Something went wrong");
    }
  };
</script>

<div class="space-y-5">
  <div>
    <h1 class="text-center text-3xl font-semibold">Account setup</h1>
    <h2 class="text-center text-2xl text-secondary">Step 2</h2>
  </div>

  <form
    on:submit|preventDefault={submit}
    class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5"
  >
    <p class="text-secondary mb-1">
      Add an additional password to your seed phrase. It should be different
      than your login password. We can't reset it if you lose it.
    </p>

      <input use:focus type="text" placeholder="Password" bind:value={password} />

    <button
      class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
    >
      Submit
    </button>
  </form>
</div>
