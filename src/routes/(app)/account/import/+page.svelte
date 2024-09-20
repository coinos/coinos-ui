<script>
  import { goto } from "$app/navigation";
  import { mnemonic } from "$lib/store";
  import { versions } from "$lib/utils";
  import { t } from "$lib/translations";
  import { browser } from "$app/environment";
  import Icon from "$comp/Icon.svelte";
  import { validateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";

  let el, pasted, text;

  let paste = async () => {
    text = await navigator.clipboard.readText();
    pasted = true;
  };

  let submit = () => {
    let valid = validateMnemonic(text, wordlist);
    if (valid) {
      $mnemonic = text;
      goto("/account/pass");
    } else {
      fail("Failed to validate seed phrase");
    }
  };

  $: if (browser && pasted && text) form.submit() && (pasted = false);
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Import</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <div class="space-y-5">
      <form on:submit|preventDefault={submit}>
        <textarea
          use:focus
          name="text"
          placeholder="Enter a seed phrase"
          class="w-full p-4 border rounded-xl h-48 text-xl"
          bind:value={text}
          autocapitalize="none"
        />
        <button
          bind:this={el}
          type="submit"
          class="flex bg-black text-white border rounded-2xl px-6 py-5 w-full font-bold gap-2 justify-center"
        >
          <Icon icon="send" style="w-8 my-auto invert" />
          <div class="my-auto">{$t("user.send.next")}</div>
        </button>
      </form>
    </div>
  </div>
</div>
