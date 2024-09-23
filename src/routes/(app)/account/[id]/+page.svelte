<script>
  import WalletPass from "$comp/WalletPass.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { decrypt } from "nostr-tools/nip49";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";

  export let data;
  let { account, user } = data;
  let { id, name, seed } = account;
  let mnemonic, password;
  let passwordPrompt;
  let cancel = () => (passwordPrompt = false);
  let toggle = () => (passwordPrompt = !passwordPrompt);

  let submit = async () => {
    toggle();
    let entropy = await decrypt(seed, password);
    mnemonic = entropyToMnemonic(entropy, wordlist);
  };

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
  <h1 class="text-center text-3xl font-semibold">Account settings</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST">
      <div>
        <label for="display" class="font-bold mb-1 block">Account name</label>
        <input use:focus type="text" name="name" bind:value={name} />
      </div>

      <div class="space-y-2">
        <button
          type="submit"
          class="rounded-2xl border py-3 font-bold mx-auto bg-black text-white px-4 w-full"
          >Submit</button
        >
        {#if mnemonic}
          <div class="p-8">{mnemonic}</div>

          <button
            on:click={() => copy(mnemonic)}
            type="button"
            class="flex gap-2 rounded-2xl border py-3 font-bold mx-auto px-4 w-full justify-center"
          >
            <Icon icon="copy" style="w-8 my-auto" />
            <div class="my-auto">Copy</div></button
          >
        {:else if seed}
          <button
            on:click={toggle}
            type="button"
            class="flex gap-2 rounded-2xl border py-3 font-bold mx-auto px-4 w-full justify-center bg-primary"
          >
            <Icon icon="eye" style="w-8 my-auto" />
            <div class="my-auto">Reveal mnemonic</div></button
          >
        {/if}

        {#if seed}
        <button
          on:click={del}
          type="button"
          class="flex gap-2 rounded-2xl border py-3 font-bold mx-auto px-4 w-full justify-center bg-primary"
        >
          <Icon icon="trash" style="w-8 my-auto" />
          <div class="my-auto"><span class="text-red-600">Delete</span> account</div></button
        >
        {/if}
      </div>

      <div />
    </form>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel bind:submit />
{/if}
