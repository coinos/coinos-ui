<script lang="ts">
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
  import { isPrfEncrypted, prfDecrypt } from "$lib/crypto";
  import { getCachedPrfKey } from "$lib/passwordCache";
  import Spinner from "$comp/Spinner.svelte";

  let { data } = $props();
  let user = $derived(data.user);
  let creating = $state(false);

  onMount(async () => {
    if (!browser) return;
    if (user.seed && isPrfEncrypted(user.seed)) {
      const prfKey = getCachedPrfKey();
      if (prfKey) {
        creating = true;
        try {
          const entropy = await prfDecrypt(prfKey, user.seed);
          const mn = entropyToMnemonic(entropy, wordlist);
          const seed = await mnemonicToSeed(mn);
          const master = HDKey.fromMasterSeed(seed, versions);
          const child = master.derive("m/84'/0'/0'");
          const pubkey = child.publicExtendedKey;
          const fingerprint = child.fingerprint.toString(16).padStart(8, "0");
          await post("/account", {
            fingerprint,
            pubkey,
            name: $t("accounts.savings"),
            type: "bitcoin",
            accountIndex: 0,
          });
          goto(`/${user.username}`);
        } catch (e: any) {
          console.log(e);
          fail(e.message);
          creating = false;
        }
      } else {
        goto(`/${user.username}`);
      }
      return;
    }
    if (!$mnemonic) await generate();
  });

  let generate = async () => {
    $mnemonic = await generateMnemonic(wordlist);
  };
</script>

{#if creating}
  <div class="flex justify-center py-20">
    <Spinner />
  </div>
{:else}
<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.seedPhrase")}</h1>

  <div class="container w-full mx-auto px-4 max-w-xl space-y-2">
    {#if $mnemonic}
      <Mnemonic mnemonic={$mnemonic} />
    {/if}

    <button type="button" class="btn" onclick={() => copy($mnemonic)}>
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("payments.copy")}</div>
    </button>

    <div class="flex gap-2">
      <a href={`/account/bitcoin`} class="contents">
        <button type="button" class="btn !w-auto grow">{$t("accounts.back")}</button>
      </a>
      <a href={`/account/pass`} class="contents">
        <button type="button" class="btn btn-accent !w-auto grow">{$t("accounts.next")}</button>
      </a>
    </div>
  </div>
</div>
{/if}
