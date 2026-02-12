<script lang="ts">
  import { getWallet, syncTransactions, settle } from "$lib/ark";
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
  import { s, f, toFiat, success, getCookie, warning } from "$lib/utils";
  import { t, locale, loading } from "$lib/translations";
  import { goto, invalidate, afterNavigate, preloadData } from "$app/navigation";

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
    }
  });

  let arkSyncing = false;

  let arkSync = async () => {
    if (arkSyncing) return;
    arkSyncing = true;

    try {
      const aid = getCookie("aid") || user.id;
      const result = await syncTransactions(aid);

      if (result?.received > 0) {
        if ($fiat && $rateStore && user?.currency) {
          success(`Received ${f(toFiat(result.received, $rateStore as number), user.currency)}!`);
        } else {
          success(`Received ⚡️${s(result.received)}!`);
        }
      }

      if (result?.synced) invalidate("app:payments");
    } catch (e) {
      console.error("Ark sync failed:", e);
    } finally {
      arkSyncing = false;
    }
  };

  onMount(async () => {
    if (browser) {
      checkSocket();
      $pin = getCookie("pin");

      if (user) {
        const wallet = await getWallet();
        if (wallet) {
          wallet.notifyIncomingFunds(arkSync);

          arkSync();

          settle().catch((e) => console.error("Ark settle failed:", e));
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
