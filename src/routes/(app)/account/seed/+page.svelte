<script>
  import Mnemonic from "$comp/Mnemonic.svelte";
  import { browser } from "$app/environment";
  import { tick, onMount } from "svelte";
  import { copy } from "$lib/utils";
  import { t } from "$lib/translations";
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

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    {#if $mnemonic}
      <Mnemonic mnemonic={$mnemonic} />
    {/if}

    <button type="button" class="btn" onclick={generate}>
      <iconify-icon noobserver icon="ph:dice-three-bold" width="32" />
      <div class="my-auto">{$t("accounts.regenerate")}</div>
    </button>

    <button type="button" class="btn" onclick={() => copy($mnemonic)}>
      <iconify-icon noobserver icon="ph:copy-bold" width="32" />
      <div class="my-auto">
        {$t("payments.copy")}
      </div>
    </button>

    <div class="flex gap-2">
      <a href={`/account/savings`} class="contents">
        <button type="button" class="btn !w-auto grow">
          {$t("accounts.back")}
        </button>
      </a>
      <a href={`/account/pass`} class="contents">
        <button type="button" class="btn btn-accent !w-auto grow">
          {$t("accounts.next")}
        </button>
      </a>
    </div>
  </div>
</div>
