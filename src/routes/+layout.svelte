<script>
  import { run } from "svelte/legacy";

  import { browser } from "$app/environment";
  import { PUBLIC_DOMAIN } from "$env/static/public";
  import "../app.css";
  import { loading, t } from "$lib/translations";
  import { onMount } from "svelte";
  import { installPrompt, theme as themeStore } from "$lib/store";

  let { data, children } = $props();
  let { pathname, theme } = $state(data);
  $effect(() => ($themeStore = data.theme));
  $effect(() => (theme = $themeStore));

  let host = PUBLIC_DOMAIN.includes("localhost")
    ? `http://${PUBLIC_DOMAIN}`
    : `https://${PUBLIC_DOMAIN}`;

  onMount(() => {
    if (!browser) return;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      $installPrompt = event;
    });
  });
</script>

<svelte:head>
  <title>coinos</title>
  <meta property="og:title" content="coinos" />
  <meta name="twitter:title" content="coinos" />

  <meta property="og:image" content={`${host}/images/logo.webp`} />

  <meta property="og:type" content="website" />
  <meta property="og:description" content="An easy to use bitcoin web wallet" />
  <meta name="description" content="An easy to use bitcoin web wallet" />

  <meta name="keywords" content="coinos easy bitcoin web wallet" />

  <meta name="twitter:image" content={`${host}/images/logo.webp`} />
  <meta name="twitter:card" content="summary_large_image" />

  <meta property="og:url" content={host + pathname} />
  <meta name="twitter:site" content="@coinoswallet" />
  <meta name="twitter:creator" content="@coinoswallet" />
</svelte:head>

{#if !$loading}
  <main data-theme={theme}>
    {@render children?.()}
  </main>
{/if}

<style global>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 8rem;
    --toastContainerLeft: calc(50vw - 8rem);
    --toastBackground: #292929;
  }
</style>
