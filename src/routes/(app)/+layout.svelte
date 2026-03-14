<script lang="ts">
  import { arkkey, arkaid } from "$lib/ark";
  import { syncBitcoinVault } from "$lib/bitcoinSync";

  const ark = () => import("$lib/ark");
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
    paymentSignal,
    pin,
    theme as themeStore,
    fiat,
    rate as rateStore,
    cachedUser,
    cachedAccounts,
    offline,
  } from "$lib/store";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import LoadingSplash from "$comp/LoadingSplash.svelte";
  import AppHeader from "$comp/AppHeader.svelte";
  import OfflineBanner from "$comp/OfflineBanner.svelte";
  import Nostr from "$comp/Nostr.svelte";
  import Password from "$comp/Password.svelte";
  import { s, f, toFiat, success, getCookie, warning, post } from "$lib/utils";
  import { t, locale } from "$lib/translations";
  import { goto, invalidate, afterNavigate } from "$app/navigation";


  let { data, children } = $props();

  let user = $derived(data.user);
  let subject = $derived(($page.data as any).subject);
  let token = $derived(data.token);
  let theme = $derived(data.theme);

  $effect(() => {
    $themeStore = theme;
  });
  $effect(() => {
    theme = $themeStore;
  });
  $effect(() => {
    if (user) $cachedUser = user;
  });

  const getBtcVaultAid = () => {
    const accounts = $cachedAccounts;
    if (!accounts?.length) return null;
    const aid = getCookie("aid") || user?.id;
    const active = accounts.find((a: any) => a.id === aid);
    if (active?.pubkey && active?.fingerprint && active?.type !== "ark") return active.id;
    return null;
  };

  let btcSyncTimer: ReturnType<typeof setInterval> | undefined;

  const btcSync = async () => {
    const aid = getBtcVaultAid();
    if (!aid) return;
    const result = await syncBitcoinVault(aid);
    if (!result) return;

    if (result.received > 0) {
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
  };

  afterNavigate(() => {
    document.cookie = `pathname=${$page.url.pathname}; path=/; max-age=86400`;
    if (user && $arkkey) arkSync("afterNavigate");
    if (user) btcSync();
  });

  let arkSyncing = false;
  let arkForwarding = false;

  let arkSync = async (source = "unknown") => {
    const { syncTransactions, sendArk, arkSending, vaultForwarding } = await ark();
    if (arkSyncing || arkSending) {
      return;
    }
    arkSyncing = true;

    try {
      const aid = $arkaid || getCookie("aid") || user.id;
      const result = await syncTransactions(aid);
      if (result?.forward && !arkForwarding) {
        arkForwarding = true;
        try {
          const { serverArkAddress, amount, iid } = result.forward;
          const txid = await sendArk(serverArkAddress, amount);
          await post("/ark/vault-send", { hash: txid, amount, aid });
          await post("/ark/receive", { amount, hash: txid, iid });
        } catch (e) {
          console.error("Ark custodial forward failed:", e);
        } finally {
          arkForwarding = false;
        }
      } else if (result?.received > 0 && !vaultForwarding) {
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
  let aspStopFunc: (() => void) | undefined;

  const initArk = async () => {
    const key = $arkkey;
    if (!key || arkInitializedKey === key) return;
    arkInitializedKey = key;

    const { getWallet, subscribeToAsp, syncTransactions, settle, refresh, vaultForwarding, getServiceWorkerWallet } = await ark();
    const wallet = await getWallet();
    if (wallet) {
      localStorage.setItem("arkkey:uid", user.id);

      // Subscribe directly to ASP event stream (bypasses SDK's fragile wrapper)
      aspStopFunc?.();
      aspStopFunc = subscribeToAsp(async () => {
        // Retry arkSync with backoff — indexer needs time to process the new VTXO
        for (const delay of [1000, 3000, 8000]) {
          await new Promise((r) => setTimeout(r, delay));
          const aid = $arkaid || getCookie("aid") || user.id;
          const result = await syncTransactions(aid);
          if (result?.received > 0 && !vaultForwarding) {
            const paidPayment = result.payments?.find((p: any) => p.iid && p.amount > 0);
            if (paidPayment) {
              goto(`/invoice/${paidPayment.iid}`);
            } else if ($fiat && $rateStore && user?.currency) {
              success(`Received ${f(toFiat(result.received, $rateStore as number), user.currency)}!`);
            } else {
              success(`Received ${s(result.received)}!`);
            }
            invalidate("app:payments");
            return;
          }
        }
        invalidate("app:payments");
      });

      arkSync("initArk");
      if (!localStorage.getItem("ark:skipSettle")) {
        refresh().catch((e) => console.error("Ark refresh failed:", e));
        settle().catch((e) => console.error("Ark settle failed:", e));
      }

      // Init service worker wallet for background fund notifications
      getServiceWorkerWallet().catch((e) => console.error("SW wallet init:", e));

      // Listen for VTXO/UTXO updates from the service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "VTXO_UPDATE" || event.data?.type === "UTXO_UPDATE") {
            arkSync("serviceWorker");
          }
        });
      }

      // Periodically recover expired VTXOs
      if (!localStorage.getItem("ark:skipSettle") && arkRefreshTimer) clearInterval(arkRefreshTimer);
      if (!localStorage.getItem("ark:skipSettle")) {
        arkRefreshTimer = setInterval(() => {
          refresh().catch((e) => console.error("Ark periodic refresh failed:", e));
        }, 60_000);
      }
    }
  };

  $effect(() => {
    if (browser && user && $arkkey) initArk();
  });

  $effect(() => {
    if ($paymentSignal && $arkkey) arkSync("paymentSignal");
    if ($paymentSignal) btcSync();
  });

  $effect(() => {
    if (browser && user && getBtcVaultAid()) {
      btcSyncTimer = setInterval(btcSync, 30_000);
      return () => {
        if (btcSyncTimer) clearInterval(btcSyncTimer);
      };
    }
  });


  onMount(async () => {
    if (browser) {
      if (import.meta.env.DEV && navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) reg.unregister();
      }

      $offline = !navigator.onLine;
      const goOnline = () => ($offline = false);
      const goOffline = () => ($offline = true);
      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);

      checkSocket();
      $pin = getCookie("pin");

      if (user) {
        const storedUid = localStorage.getItem("arkkey:uid");
        if (storedUid && storedUid !== user.id) {
          $arkkey = "";
          $arkaid = "";
          localStorage.removeItem("arkkey:uid");
        }

        // Auto-unlock ark wallet if silent entropy is available
        if (!$arkkey) ark().then(({ autoUnlockArk }) => autoUnlockArk());

        // Auto-unlock nostr key if silent entropy is available
        import("$lib/seed").then(({ autoUnlockNostr }) => autoUnlockNostr(user.pubkey));

        // Ensure MLS key package is published (once per session)
        if (user.pubkey && !sessionStorage.getItem("kp-checked")) {
          sessionStorage.setItem("kp-checked", "1");
          import("$lib/messaging").then(({ fetchKeyPackage, publishKeyPackage }) => {
            fetchKeyPackage(user.pubkey).then((kp) => {
              if (!kp) publishKeyPackage(user).catch(() => {});
            }).catch(() => {});
          });
        }
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
      if (arkRefreshTimer) clearInterval(arkRefreshTimer);
      if (btcSyncTimer) clearInterval(btcSyncTimer);
      aspStopFunc?.();
      ark().then(({ cleanupServiceWorkerWallet }) => cleanupServiceWorkerWallet());
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
  <OfflineBanner />
  <AppHeader {user} {subject} />
  {@render children?.()}
</main>
