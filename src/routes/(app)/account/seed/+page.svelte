<script lang="ts">
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import Mnemonic from "$comp/Mnemonic.svelte";
  import { browser } from "$app/environment";
  import { tick, onMount } from "svelte";
  import { copy, versions, fail, post } from "$lib/utils";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import { generateMnemonic, mnemonicToSeed, entropyToMnemonic } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { HDKey } from "@scure/bip32";
  import { goto } from "$app/navigation";
  import { getCachedPrfKey } from "$lib/passwordCache";
  import Spinner from "$comp/Spinner.svelte";

  let { data } = $props();
  let user = $derived(data.user);
  let creating = $state(true);

  onMount(async () => {
    if (!browser) return;
    const { getWalletEntropy } = await import("$lib/walletEntropy");
    const prfKey = await getWalletEntropy();
    if (prfKey) {
      try {
        const entropy = new Uint8Array(prfKey).slice(0, 16);
        const mn = entropyToMnemonic(entropy, wordlist);
        const seed = await mnemonicToSeed(mn);
        const master = HDKey.fromMasterSeed(seed, versions);
        const accounts = await fetch("/api/accounts").then((r) => r.json());
        const nextIdx = (accounts || [])
          .filter((a: any) => a.pubkey && a.fingerprint && a.type !== "ark")
          .reduce((max: number, a: any) => Math.max(max, (a.accountIndex ?? 0) + 1), 0);
        const child = master.derive(`m/84'/0'/${nextIdx}'`);
        const pubkey = child.publicExtendedKey;
        const fingerprint = child.fingerprint.toString(16).padStart(8, "0");
        await post("/api/accounts", {
          fingerprint,
          pubkey,
          name: $t("accounts.vault"),
          type: "bitcoin",
          accountIndex: nextIdx,
        });
        await goto(`/${user.username}`);
      } catch (e: any) {
        console.log(e);
        fail(e.message);
        creating = false;
      }
      return;
    }
    creating = false;
    if (!$mnemonic) await generate();
  });

  let generate = async () => {
    $mnemonic = await generateMnemonic(wordlist);
  };
</script>

{#if creating}
  <div class="flex justify-center py-20">
    <Spinner class="text-gray-400" />
  </div>
{:else}
<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.seedPhrase")}</h1>

  <div class="container w-full mx-auto px-4 max-w-xl space-y-2">
    {#if $mnemonic}
      <Mnemonic mnemonic={$mnemonic} />
    {/if}

    <button type="button" class="btn" onclick={() => copy($mnemonic)}>
      <PhCopyBold width="32" />
      <div class="my-auto">{$t("payments.copy")}</div>
    </button>

    <a href={`/account/pass`} class="contents">
      <button type="button" class="btn btn-accent w-full">{$t("accounts.next")}</button>
    </a>
  </div>
</div>
{/if}
