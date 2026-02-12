<script lang="ts">
  import { run, preventDefault } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import { mnemonic } from "$lib/store";
  import { fail, focus, versions } from "$lib/utils";
  import { t } from "$lib/translations";
  import { browser } from "$app/environment";
  import { validateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";

  let el = $state(),
    pasted = $state(),
    text = $state();

  let paste = async () => {
    text = await navigator.clipboard.readText();
    pasted = true;
  };

  let submit = () => {
    text = text.replace(/,/g, " ").trim();
    let valid = validateMnemonic(text, wordlist);
    if (valid) {
      $mnemonic = text;
      goto("/account/pass");
    } else {
      fail("Failed to validate seed phrase");
    }
  };

  run(() => {
    if (browser && pasted && text) form.submit() && (pasted = false);
  });
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.import")}</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form onsubmit={preventDefault(submit)} class="space-y-2">
      <textarea
        use:focus
        name="text"
        placeholder={$t("accounts.enterSeed")}
        class="w-full p-4 border rounded-xl h-48 text-xl"
        bind:value={text}
        autocapitalize="none"
      ></textarea>
      <div class="flex gap-2">
        <a href={`/account/bitcoin`} class="contents">
          <button type="button" class="btn !w-auto grow">{$t("accounts.back")}</button>
        </a>
        <button bind:this={el} type="submit" class="btn btn-accent !w-auto grow">
          <div class="my-auto">{$t("accounts.next")}</div>
        </button>
      </div>
    </form>
  </div>
</div>
