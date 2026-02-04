<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { goto } from "$app/navigation";
  import { mnemonic } from "$lib/store";
  import { fail, focus, versions } from "$lib/utils";
  import { t } from "$lib/translations";
  import { browser } from "$app/environment";
  import { validateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";

  let el = $state(), pasted = $state(), text = $state();

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
      <button
        bind:this={el}
        type="submit"
        class="flex bg-black text-white border rounded-2xl px-6 py-5 w-full font-bold gap-2 justify-center"
      >
        <iconify-icon
          noobserver
          icon="ph:paper-plane-right-bold"
          width="32"
          class="my-auto invert"
        ></iconify-icon>
        <div class="my-auto">{$t("user.send.next")}</div>
      </button>
    </form>
  </div>
</div>
