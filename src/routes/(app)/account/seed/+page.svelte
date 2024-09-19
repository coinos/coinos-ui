<script>
  import { browser } from "$app/environment";
  import { tick, onMount } from "svelte";
  import { copy } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { mnemonic } from "$lib/store";
  import { generateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";

  export let data;
  let { user } = data;

  onMount(async () => {
    if (!browser) return;
    await generate();
  });

  let generate = async () => {
    $mnemonic = await generateMnemonic(wordlist);
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Seed phrase</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if $mnemonic}
      <div
        class="text-lg border p-4 rounded-2xl text-secondary grid grid-cols-3 gap-2 justify-center"
      >
        {#each $mnemonic.split(" ") as w, i}
          <div>
            <span class="select-none text-sm text-black">{i + 1}.</span>
            <span>{@html w === "-" ? "&mdash;" : w}</span>
          </div>
        {/each}
      </div>
    {/if}

    <div>
      <button
        type="button"
        class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-5 px-6 w-full mx-auto justify-center border whitespace-nowrap mb-2"
        on:click={generate}
      >
        <Icon icon="random" style="w-8 my-auto" />
        <div class="my-auto">Regenerate</div>
      </button>

      <button
        type="button"
        class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-5 px-6 w-full mx-auto justify-center border whitespace-nowrap mb-2"
        on:click={() => copy($mnemonic)}
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
          class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
        >
          Back
        </button>
      </a>
      <a href={`/account/pass`} class="contents">
        <button
          type="button"
          class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
        >
          Next
        </button>
      </a>
    </div>
  </div>
</div>
