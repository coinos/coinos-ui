<script>
  import { copy } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { mnemonic } from "$lib/store";
  import { generateMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english";

  export let data;
  let { user } = data;

  let reveal;

  let toggleSeed = async () => {
    try {
      $mnemonic = await generateMnemonic(wordlist);
      reveal = !reveal;
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Account setup</h1>
  <h2 class="text-center text-2xl text-secondary">Step 1</h2>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <p class="text-secondary mb-1">
      Whoever knows these words in the correct order can withdraw funds from the account. We can't
      recover them if you lose them.
    </p>

    {#if reveal}
      <div class="text-2xl border p-4 text-center rounded-2xl">
        {$mnemonic}
      </div>

      <div>
        <a href={`/account/setup/step2`} class="contents">
          <button
            type="button"
            class="bg-black text-white w-full px-5 py-6 text-xl rounded-2xl font-bold"
            on:click={toggleSeed}
          >
            I've written down my seed phrase
          </button>
        </a>
      </div>
    {:else}
      <div class="flex justify-center">
        <button type="button" class="primary" on:click={toggleSeed}>
          <Icon icon="warning" style="mr-2 w-6 my-auto" />
          {$t("user.settings.revealSeed")}
        </button>
      </div>
    {/if}
  </div>
</div>
