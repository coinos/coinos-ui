<script lang="ts">
  import { getWallet, syncTransactions, settle, refresh, arkkey, arkaid, sendArk, arkSending, arkServerUrl } from "$lib/ark";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { onDestroy, onMount } from "svelte";
  import { close, connect, send, socket } from "$lib/socket";
  import {
    last,
    invoice,
    request,
    ndef,
    passwordPrompt,
    selectSigner,
    password,
    pin,
    theme as themeStore,
    fiat,
    rate as rateStore,
  } from "$lib/store";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import LoadingSplash from "$comp/LoadingSplash.svelte";
  import AppHeader from "$comp/AppHeader.svelte";
  import Nostr from "$comp/Nostr.svelte";
  import Password from "$comp/Password.svelte";
  import { s, f, toFiat, success, getCookie, warning, post, versions } from "$lib/utils";
  import { t, locale, loading } from "$lib/translations";
  import { goto, invalidate, afterNavigate, preloadData } from "$app/navigation";
  import { getCachedPrfKey } from "$lib/passwordCache";

  let { data, children } = $props();

  let user = $derived(data.user);
  let subject = $derived(data.subject);
  let token = $derived(data.token);
  let theme = $derived(data.theme);

  $effect(() => {
    $themeStore = theme;
  });
  $effect(() => {
    theme = $themeStore;
  });

  afterNavigate(() => {
    document.cookie = `pathname=${$page.url.pathname}; path=/; max-age=86400`;
    if (user) {
      preloadData(`/${user.username}`);
      preloadData(`/${user.username}/receive`);
      preloadData("/payments");
      preloadData("/send");
      if ($arkkey) arkSync();
    }
  });

  let arkSyncing = false;
  let arkForwarding = false;

  let arkSync = async () => {
    if (arkSyncing || arkSending) return;
    arkSyncing = true;

    try {
      const aid = $arkaid || getCookie("aid") || user.id;
      const result = await syncTransactions(aid);

      if (result?.forward && !arkForwarding) {
        arkForwarding = true;
        try {
          const { serverArkAddress, amount, iid } = result.forward;
          const txid = await sendArk(serverArkAddress, amount);
          await post("/post/ark/vault-send", { hash: txid, amount, aid });
          await post("/post/ark/receive", { amount, hash: txid, iid });
        } catch (e) {
          console.error("Ark custodial forward failed:", e);
        } finally {
          arkForwarding = false;
        }
      } else if (result?.received > 0) {
        const paidPayment = result.payments?.find((p: any) => p.iid && p.amount > 0);
        if (paidPayment) {
          goto(`/invoice/${paidPayment.iid}`);
        } else if ($fiat && $rateStore && user?.currency) {
          success(`Received ${f(toFiat(result.received, $rateStore as number), user.currency)}!`);
        } else {
          success(`Received ${s(result.received)}!`);
        }
      }

      invalidate("app:payments");
    } catch (e) {
      console.error("Ark sync failed:", e);
    } finally {
      arkSyncing = false;
    }
  };

  let arkInitializedKey: string | undefined;
  let arkRefreshTimer: ReturnType<typeof setInterval> | undefined;
  let arkSyncTimer: ReturnType<typeof setInterval> | undefined;

  const initArk = async () => {
    const key = $arkkey;
    if (!key || arkInitializedKey === key) return;
    arkInitializedKey = key;

    const wallet = await getWallet();
    if (wallet) {
      localStorage.setItem("arkkey:uid", user.id);
      wallet.notifyIncomingFunds(arkSync);
      arkSync();
      refresh().catch((e) => console.error("Ark refresh failed:", e));
      settle().catch((e) => console.error("Ark settle failed:", e));

      // Poll for incoming ark transactions (fallback for SSE)
      if (arkSyncTimer) clearInterval(arkSyncTimer);
      arkSyncTimer = setInterval(() => arkSync(), 15_000);

      // Periodically recover expired VTXOs
      if (arkRefreshTimer) clearInterval(arkRefreshTimer);
      arkRefreshTimer = setInterval(() => {
        refresh().catch((e) => console.error("Ark periodic refresh failed:", e));
      }, 60_000);
    }
  };

  $effect(() => {
    if (browser && user && $arkkey) initArk();
  });

  let autoProvisionAccounts = async () => {
    if (!user) return;
    if (sessionStorage.getItem("accounts:provisioned")) return;
    const prfKey = getCachedPrfKey();
    if (!prfKey) return;

    sessionStorage.setItem("accounts:provisioned", "1");

    try {
      const res = await fetch("/account", { headers: { accept: "application/json" } });
      const accounts = await res.json();

      const hasBitcoin = accounts.some((a: any) => a.type === "bitcoin");
      const hasArk = accounts.some((a: any) => a.type === "ark");
      if (hasBitcoin && hasArk) return;

      const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);

      const entropy = new Uint8Array(prfKey);
      const mnemonic = entropyToMnemonic(entropy, wordlist);
      const seed = await mnemonicToSeed(mnemonic);
      const master = HDKey.fromMasterSeed(seed, versions);

      if (!hasArk) {
        const { SingleKey, Wallet } = await import("@arkade-os/sdk");
        const { bytesToHex } = await import("@noble/hashes/utils.js");
        const arkChild = master.derive("m/86'/0'/0'/0/0");
        const arkHex = bytesToHex(arkChild.privateKey!);
        const identity = SingleKey.fromHex(arkHex);
        const wallet = await Wallet.create({ identity, arkServerUrl });
        const arkAddress = await wallet.getAddress();
        await post("/account", { name: "Savings", type: "ark", arkAddress });
      }

      if (!hasBitcoin) {
        const child = master.derive("m/84'/0'/0'");
        await post("/account", {
          fingerprint: child.fingerprint.toString(16).padStart(8, "0"),
          pubkey: child.publicExtendedKey,
          name: "Vault",
          type: "bitcoin",
          accountIndex: 0,
        });
      }

      invalidate("app:payments");
    } catch (e) {
      console.error("Auto-provision accounts failed:", e);
      sessionStorage.removeItem("accounts:provisioned");
    }
  };

  onMount(async () => {
    if (browser) {
      checkSocket();
      $pin = getCookie("pin");

      if (user) {
        const storedUid = localStorage.getItem("arkkey:uid");
        if (storedUid && storedUid !== user.id) {
          $arkkey = "";
          $arkaid = "";
          localStorage.removeItem("arkkey:uid");
        }

        autoProvisionAccounts();
      }

      // if (window.NDEFReader) {
      //   try {
      //     $ndef = new NDEFReader();
      //     await $ndef.scan();
      //
      //     $ndef.addEventListener("readingerror", (e) => {
      //       console.log("nfc error", e);
      //     });
      //
      //     $ndef.addEventListener("reading", ({ message, serialNumber }) => {
      //       console.log("MESSAGE", message);
      //
      //       const record = message.records[0];
      //
      //       if (record.recordType === "url") {
      //         const textDecoder = new TextDecoder();
      //         const url = textDecoder.decode(record.data);
      //         console.log("URL:", url);
      //
      //         // Navigate to the URL or use it however you want
      //         goto(`/send/${encodeURIComponent(url)}`);
      //       } else {
      //         console.error("Unsupported record type:", record.recordType);
      //       }
      //     });
      //   } catch (error) {
      //     console.log("Argh! " + error);
      //   }
      // }
    }
  });

  let checkTimer,
    counter = 0;

  let checkSocket = () => {
    counter++;
    let lost = socket?.readyState !== 1 || !$last || Date.now() - ($last as number) > 30000;
    if (lost) connect(token);
    if (counter > 5) {
      send("heartbeat", token);
      counter = 0;
    }

    checkTimer = setTimeout(checkSocket, 1000);
  };

  onDestroy(() => {
    if (browser) {
      close();
      clearTimeout(checkTimer);
      if (arkSyncTimer) clearInterval(arkSyncTimer);
      if (arkRefreshTimer) clearInterval(arkRefreshTimer);
    }
  });
</script>

{#if browser && user && $passwordPrompt}
  <Password {user} />
{/if}

{#if browser}
  <Nostr />
{/if}

<svelte:head>
  {#if subject}
    <title>coinos - {subject.username}</title>
    <meta name="lightning" content={`lnurlp:${subject.username}@coinos.io`} />
  {:else}
    <title>coinos</title>
  {/if}

  {#if subject?.profile}
    <meta name="og:image" content={`/api/public/${subject.profile}.webp`} />
  {:else}
    <meta property="og:image" content="/images/logo.webp" />
  {/if}
</svelte:head>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />

<main class="pb-4 min-h-dvh" data-theme={theme}>
  <AppHeader {user} {subject} />
  {#if !$loading}
    {@render children?.()}
  {/if}
</main>
