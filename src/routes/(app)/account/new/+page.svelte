<script lang="ts">
  import LogosBitcoin from "virtual:icons/logos/bitcoin";
  import { t } from "$lib/translations";
  import Spinner from "$comp/Spinner.svelte";
  import { bytesToHex } from "@noble/hashes/utils.js";
  import { fail, post, versions } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { arkServerUrl } from "$lib/ark";
  import { HDKey } from "@scure/bip32";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";

  let { data } = $props();
  let user = $derived(data.user);

  let creatingArk = $state(false);

  let createArk = async () => {
    creatingArk = true;
    try {
      const { getWalletEntropy } = await import("$lib/walletEntropy");
      const entropy = await getWalletEntropy();
      if (!entropy) {
        fail($t("accounts.failedToDecryptSeed") as string);
        creatingArk = false;
        return;
      }

      const { SingleKey, Wallet } = await import("@arkade-os/sdk");
      const ent = new Uint8Array(entropy).slice(0, 16);
      const mnemonic = entropyToMnemonic(ent, wordlist);
      const seed = await mnemonicToSeed(mnemonic);
      const master = HDKey.fromMasterSeed(seed, versions);
      const arkChild = master.derive("m/86'/0'/0'/0/0");
      const arkHex = bytesToHex(arkChild.privateKey!);
      const identity = SingleKey.fromHex(arkHex);
      const wallet = await Wallet.create({ identity, arkServerUrl });
      const arkAddress = await wallet.getAddress();

      await post("/accounts", { name: $t("accounts.savings"), type: "ark", arkAddress });
      goto(`/${user.username}`);
    } catch (e: any) {
      console.log("Ark account creation failed", e);
      fail(e.message || ($t("accounts.failedToDecryptSeed") as string));
      creatingArk = false;
    }
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.chooseAccountType")}</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <a href="/account/bitcoin" class="block">
      <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200 gap-4 items-center">
        <LogosBitcoin width={48} />
        <div>
          <div class="text-xl">{$t("accounts.bitcoinOnChain")}</div>
          <div class="text-secondary">
            {$t("accounts.bitcoinOnChainDesc")}
          </div>
        </div>
      </div>
    </a>
    {#if !data.hasArk}
      <button type="button" class="block w-full text-left" onclick={createArk} disabled={creatingArk}>
        <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200 gap-4 items-center">
          {#if creatingArk}
            <Spinner />
          {:else}
            <img src="/images/ark.png" class="w-12 h-12 rounded-full object-cover bg-neutral" alt="Ark" />
          {/if}
          <div>
            <div class="text-xl">{$t("accounts.arkOffChain")}</div>
            <div class="text-secondary">
              {$t("accounts.arkOffChainDesc")}
            </div>
          </div>
        </div>
      </button>
    {/if}
  </div>
</div>
