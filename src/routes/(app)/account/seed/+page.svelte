<script>
  import Mnemonic from "$comp/Mnemonic.svelte";
  import { browser } from "$app/environment";
  import { tick, onMount } from "svelte";
  import { copy } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { mnemonic } from "$lib/store";
  import { generateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";

  let { data } = $props();
  let { user } = data;

  onMount(async () => {
    if (!browser) return;
    if (!$mnemonic) await generate();
  });

  let generate = async () => {
    $mnemonic = await generateMnemonic(wordlist);
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">
    {$t("accounts.seedPhrase")}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if $mnemonic}
      <Mnemonic mnemonic={$mnemonic} />
    {/if}

    <div>
      <button
        type="button"
        class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-3 px-4 w-full mx-auto justify-center border whitespace-nowrap mb-2"
        onclick={generate}
      >
        <Icon icon="random" style="w-8 my-auto" />
        <div class="my-auto">{$t("accounts.regenerate")}</div>
      </button>

      <button
        type="button"
        class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-3 px-4 w-full mx-auto justify-center border whitespace-nowrap mb-2"
        onclick={() => copy($mnemonic)}
      >
        <Icon icon="copy" style="w-8 my-auto" />
        <div class="my-auto">
          {$t("payments.copy")}
        </div>
      </button>
    </div>

    <div class="flex gap-2">
      <a href={`/account/savings`} class="contents">
        <button
          type="button"
          class="border w-full py-5 px-6 text-xl rounded-2xl"
        >
          {$t("accounts.back")}
        </button>
      </a>
      <a href={`/account/pass`} class="contents">
        <button
          type="button"
          class="border w-full py-5 px-6 text-xl rounded-2xl"
        >
          {$t("accounts.next")}
        </button>
      </a>
    </div>
  </div>
</div>
