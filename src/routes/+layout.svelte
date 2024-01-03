<script>
  import { PUBLIC_DOMAIN } from "$env/static/public";
  import "../app.css";
  import { loading, t } from "$lib/translations";

  export let data;
  let { pathname } = data;

  let host = PUBLIC_DOMAIN.includes("localhost")
    ? `http://${PUBLIC_DOMAIN}`
    : `https://${PUBLIC_DOMAIN}`;
</script>

<svelte:head>
	<title>swapee</title>
	<meta property="og:title" content="swapee" />
	<meta name="twitter:title" content="swapee" />

  <meta property="og:image" content={`${host}/images/logo.webp`} />

  <meta property="og:type" content="website" />
  <meta property="og:description" content="An easy to use bitcoin web wallet" />
  <meta name="description" content="An easy to use bitcoin web wallet" />

	<meta name="keywords" content="swapee easy bitcoin web wallet" />

  <meta name="twitter:image" content={`${host}/images/logo.webp`} />
  <meta name="twitter:card" content="summary_large_image" />

	<meta property="og:url" content={host + pathname} />
	<meta name="twitter:site" content="@swapeewallet" />
	<meta name="twitter:creator" content="@swapeewallet" />
</svelte:head>

{#if !$loading}
  <slot />
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
