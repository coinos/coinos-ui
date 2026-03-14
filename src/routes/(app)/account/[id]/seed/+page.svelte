<script lang="ts">
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import PhArrowLeftBold from "virtual:icons/ph/arrow-left-bold";
  import { page } from "$app/stores";
  import Mnemonic from "$comp/Mnemonic.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail } from "$lib/utils";
  import { t } from "$lib/translations";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { getCachedPrfKey } from "$lib/passwordCache";
  import { prfDecrypt, isPrfEncrypted } from "$lib/crypto";

  let { data } = $props();
  let account = $derived(data.account);
  let id = $derived(account.id);

  let mnemonic: string | undefined = $state();
  let nsec: string | undefined = $state();

  let derivationPath = $derived(
    account.type === "ark"
      ? "m/86'/0'/0'/0/0"
      : `m/84'/0'/${account.accountIndex ?? 0}'`,
  );

  let revealWithPrfKey = async () => {
    let prfKey = getCachedPrfKey();
    if (!prfKey) {
      const { getWalletEntropy } = await import("$lib/walletEntropy");
      prfKey = await getWalletEntropy();
    }
    if (!prfKey) return false;
    try {
      if (account.seed && isPrfEncrypted(account.seed)) {
        const entropy = await prfDecrypt(prfKey, account.seed);
        mnemonic = entropyToMnemonic(entropy, wordlist);
      } else {
        const entropy = new Uint8Array(prfKey).slice(0, 16);
        mnemonic = entropyToMnemonic(entropy, wordlist);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  let deriveNsec = async (m: string) => {
    const [{ HDKey }, { nip19 }] = await Promise.all([
      import("@scure/bip32"),
      import("nostr-tools"),
    ]);
    const { versions } = await import("$lib/utils");
    const seed = await mnemonicToSeed(m);
    const child = HDKey.fromMasterSeed(seed, versions).derive("m/86'/0'/0'/0/0");
    nsec = nip19.nsecEncode(child.privateKey!);
  };

  let requestMnemonic = async () => {
    if (await revealWithPrfKey()) return;
    try {
      const { deriveNostrEntropy } = await import("$lib/walletEntropy");
      const entropy = await deriveNostrEntropy();
      const ent = new Uint8Array(entropy).slice(0, 16);
      mnemonic = entropyToMnemonic(ent, wordlist);
    } catch (e) {
      fail($t("accounts.failedToDecryptSeed"));
    }
  };

  requestMnemonic();

  $effect(() => {
    if (mnemonic && account.type === "ark") deriveNsec(mnemonic);
  });
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.seedPhrase")}</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-4">
    {#if mnemonic}
      <p class="text-center text-secondary">
        Derivation path: <span class="font-mono font-bold">{derivationPath}</span>
      </p>

      <Mnemonic {mnemonic} />

      <button onclick={() => copy(mnemonic as string)} type="button" class="btn">
        <PhCopyBold width="32" />
        <div class="my-auto">{$t("accounts.copy")}</div>
      </button>

      {#if nsec}
        <h2 class="text-center text-2xl font-semibold pt-4">Nsec</h2>
        <p class="text-center text-secondary break-all font-mono text-sm">{nsec}</p>
        <button onclick={() => copy(nsec as string)} type="button" class="btn">
          <PhCopyBold width="32" />
          <div class="my-auto">{$t("accounts.copy")}</div>
        </button>
      {/if}
    {/if}

    <button onclick={() => goto(`/account/${id}`)} type="button" class="btn btn-primary">
      <PhArrowLeftBold width="32" />
      <div class="my-auto">{$t("accounts.back")}</div>
    </button>
  </div>
</div>
