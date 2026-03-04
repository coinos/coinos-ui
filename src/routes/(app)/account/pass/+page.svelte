<script lang="ts">
  import { tick, onMount } from "svelte";
  import { t } from "$lib/translations";
  import { mnemonic } from "$lib/store";
  import Spinner from "$comp/Spinner.svelte";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { get, versions, fail, post } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { HDKey } from "@scure/bip32";

  let { data }: any = $props();

  let user = $derived(data.user);
  let submitting = $state(false);

  onMount(async () => {
    if (!$mnemonic) {
      goto("/account/seed");
      return;
    }

    const { getWalletEntropy, deriveNostrEntropy } = await import("$lib/walletEntropy");
    let prfKey = await getWalletEntropy();
    if (!prfKey) {
      try {
        prfKey = await deriveNostrEntropy();
      } catch (e) {
        fail($t("accounts.failedToDecryptSeed"));
        goto(`/${user.username}`);
        return;
      }
    }

    submitting = true;
    await tick();
    try {
      const entropy = new Uint8Array(prfKey).slice(0, 16);
      const mn = entropyToMnemonic(entropy, wordlist);
      const master = HDKey.fromMasterSeed(
        await mnemonicToSeed(mn),
        versions,
      );
      const accounts = await get("/accounts");
      const nextIdx = (accounts || [])
        .filter((a: any) => a.pubkey && a.fingerprint && a.type !== "ark")
        .reduce((max: number, a: any) => Math.max(max, (a.accountIndex ?? 0) + 1), 0);
      const child = master.derive(`m/84'/0'/${nextIdx}'`);
      const pubkey = child.publicExtendedKey;
      const fingerprint = child.fingerprint.toString(16).padStart(8, "0");
      await post("/accounts", {
        fingerprint,
        pubkey,
        name: $t("accounts.vault"),
        type: "bitcoin",
        accountIndex: nextIdx,
      });

      $mnemonic = "";
      await goto(`/${user.username}`);
    } catch (e: any) {
      console.log(e);
      fail(e.message);
    }
    submitting = false;
  });
</script>

{#if submitting}
  <div class="flex justify-center py-20">
    <Spinner class="text-gray-400" />
  </div>
{/if}
