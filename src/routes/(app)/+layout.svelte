<script>
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { onDestroy, onMount } from "svelte";
  import { close, connect, send } from "$lib/socket";
  import {
    last,
    invoice,
    request,
    ndef,
    passwordPrompt,
    password,
    pin,
  } from "$lib/store";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import LoadingSplash from "$comp/LoadingSplash.svelte";
  import Invoice from "$comp/Invoice.svelte";
  import Password from "$comp/Password.svelte";
  import Request from "$comp/Request.svelte";
  import { getCookie, warning, protectedRoutes } from "$lib/utils";
  import { t, locale, loading } from "$lib/translations";
  import { goto, onNavigate } from "$app/navigation";

  export let data;

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  let { generate, rate, user, subject, token, rates } = data;

  $: update(data);
  let update = (data) => {
    ({ rate, user, subject, token, rates } = data);
  };

  onMount(async () => {
    if (browser) {
      checkSocket();
      $pin = getCookie("pin");

      if (window.NDEFReader && user.nfc) {
        try {
          $ndef = new NDEFReader();
          await $ndef.scan();

          $ndef.addEventListener("readingerror", (e) => {
            console.log("nfc error", e);
          });

          $ndef.addEventListener("reading", ({ message, serialNumber }) => {
            goto(`/send/${message}`);
          });
        } catch (error) {
          console.log("Argh! " + error);
        }
      }
    }
  });

  $: browser && connect(token);

  let lost,
    checkTimer,
    expireTimer,
    counter = 0;

  let checkSocket = () => {
    counter++;
    lost = Date.now() - $last > 30000;
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
      clearTimeout(expireTimer);
    }
  });
</script>

{#if browser && user && $passwordPrompt}
  <Password {user} />
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

<main class="pb-20">
  {#if !$loading}
    <slot />
  {/if}
</main>

{#if $invoice}
  <Invoice {user} />
{/if}

{#if $request}
  <Request {user} />
{/if}

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(60px);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-60px);
    }
  }

  :root::view-transition-old(root) {
    animation: 280ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation: 280ms cubic-bezier(0, 0, 0.2, 1) 80ms both fade-in,
      180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }
</style>
