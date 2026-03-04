<script lang="ts">
  import PhClockCounterClockwiseBold from "virtual:icons/ph/clock-counter-clockwise-bold";
  import CryptocurrencyColorBtc from "virtual:icons/cryptocurrency-color/btc";
  import PhFadersBold from "virtual:icons/ph/faders-bold";
  import PhHandCoinsBold from "virtual:icons/ph/hand-coins-bold";
  import PhPaperPlaneRightBold from "virtual:icons/ph/paper-plane-right-bold";
  import { bytesToHex } from "@noble/hashes/utils.js";
  import { run } from "svelte/legacy";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";
  import { versions, s, f, loc, toFiat } from "$lib/utils";
  import { fiat, importing } from "$lib/store";
  import { arkkey, arkaid } from "$lib/ark";
  import { prfDecrypt, isPrfEncrypted } from "$lib/crypto";

  let { user, rates, account }: any = $props();
  let currency = $derived(account.currency || user.currency);
  let rate = $derived(rates[currency]);
  let { name, seed, fingerprint, balance, pending, id, type: accountType, arkAddress } = $derived(account);

  let arkBalance = $state(0);
  let arkLoading = $state(false);

  let tryUnlockArk = async (): Promise<string | false> => {
    const deriveArkKey = async (key: ArrayBuffer): Promise<string> => {
      const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);
      let mnemonicStr: string;
      if (account.seed && isPrfEncrypted(account.seed)) {
        const ent = await prfDecrypt(key, account.seed);
        mnemonicStr = entropyToMnemonic(ent, wordlist);
      } else {
        const entropy = new Uint8Array(key).slice(0, 16);
        mnemonicStr = entropyToMnemonic(entropy, wordlist);
      }
      const s = await mnemonicToSeed(mnemonicStr);
      const master = HDKey.fromMasterSeed(s, versions);
      const arkChild = master.derive("m/86'/0'/0'/0/0");
      return bytesToHex(arkChild.privateKey!);
    };

    // Try cached PRF key or silent nsec
    const { getWalletEntropy, deriveNostrEntropy } = await import("$lib/walletEntropy");
    const entropy = await getWalletEntropy();
    if (entropy) {
      try {
        return await deriveArkKey(entropy);
      } catch (e) {
        console.log("Wallet entropy unlock failed", e);
      }
    }

    // Try interactive nostr derivation
    try {
      const interactiveEntropy = await deriveNostrEntropy();
      return await deriveArkKey(interactiveEntropy);
    } catch (e) {
      console.log("Interactive nostr unlock failed", e);
      return false;
    }
  };

  let setAccount = async (event, url) => {
    event.preventDefault();
    event.stopPropagation();
    document.cookie = `aid=${id}; path=/; max-age=86400`;
    if (isArk) {
      if ($arkkey && $arkaid === id) {
        await goto(url);
      } else {
        const key = await tryUnlockArk();
        if (key) {
          await goto(url);
          $arkkey = key;
          $arkaid = id;
        }
      }
    } else {
      $arkkey = undefined;
      goto(url);
    }
  };

  let receiveUrl = $derived(id === user.id ? "/invoice?lnurl=true" : "/invoice");

  let displayType = $derived(
    accountType === "ark"
      ? $t("accounts.ark")
      : seed || fingerprint
        ? $t("accounts.bitcoin")
        : $t("accounts.spending"),
  );
  let displayName = $derived(name || displayType);
  let isArk = $derived(accountType === "ark");

  let goPayments = (e) => {
    e.preventDefault();
    setAccount(e, "/payments");
  };

  let goSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.cookie = `aid=${id}; path=/; max-age=86400`;
    goto(`/account/${id}`);
  };
</script>

<div
  class="space-y-4 cursor-pointer hover:bg-base-200"
  aria-label="Payments"
  data-testid="account-card"
  data-account-type={accountType}
  role="button"
  tabindex="0"
  onclick={goPayments}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && goPayments(e)}
>
  <div class="flex items-start justify-between gap-4 md:p-4">
    <div>
      <div class="text-lg text-gray-400">{displayName}</div>
      {#if $importing.has(id)}
        <div class="text-lg text-gray-400">{$t("accounts.importing")}</div>
      {:else}
        <Balance {balance} {user} {rate} {id} {currency} />
        {#if pending}
          <div class="text-lg text-gray-600">
            +{$fiat && rate ? f(toFiat(pending, rate), currency, loc(user)) : s(pending)} {$t("accounts.pending")}
          </div>
        {/if}
      {/if}
    </div>
    <div class="flex items-center gap-1 shrink-0 text-base-content">
      <!-- <a -->
      <!--   href="/payments" -->
      <!--   class="hover:text-gray-800 w-10 h-10 flex items-center justify-center" -->
      <!--   aria-label="Payment history" -->
      <!--   onclick={(e) => setAccount(e, "/payments")} -->
      <!-- > -->
      <!--   <PhClockCounterClockwiseBold width="38" /> -->
      <!-- </a> -->
      <a
        href={`/account/${id}`}
        class="hover:opacity-80 relative w-10 h-10 flex items-center justify-center"
        aria-label="Account settings"
        onclick={goSettings}
      >
        {#if isArk}
          <img src="/images/ark.png" class="w-8 h-8 rounded-full object-cover bg-neutral" alt="Ark" />
        {:else if seed || fingerprint}
          <div class="w-8 h-8 flex items-center justify-center">
            <CryptocurrencyColorBtc width="32" />
          </div>
        {:else}
          <img src="/images/icon.png" class="w-8 h-8" alt="Coinos" />
        {/if}
        <!-- <PhFadersBold width="20" class="absolute -bottom-1 -right-1 text-base-content bg-base-100 rounded-full" /> -->
      </a>
    </div>
  </div>

  <div class="flex w-full text-xl gap-2">
    <a href={receiveUrl} class="contents" data-sveltekit-preload-data="tap" onclick={(e) => setAccount(e, receiveUrl)}>
      <button class="btn !w-auto flex-1" data-testid="account-receive">
        <PhHandCoinsBold width="32" style="transform: scaleX(-1)" />
        <div class="my-auto">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <a href={`/send`} class="contents" data-sveltekit-preload-data="tap" onclick={(e) => setAccount(e, "/send")}>
      <button type="button" class="btn !w-auto flex-1">
        <PhPaperPlaneRightBold width="32" />
        <div class="my-auto">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</div>
