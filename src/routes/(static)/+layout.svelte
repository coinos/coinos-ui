<script lang="ts">
  import Nostr from "$comp/Nostr.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import Footer from "$comp/Footer.svelte";
  import LandingHeader from "$comp/LandingHeader.svelte";
  import { theme as themeStore } from "$lib/store";
  import { page } from "$app/stores";

  let { data, children } = $props();
  let user = $derived(data.user);
  let theme = $state();
  $effect(() => {
    theme = $themeStore;
  });

  let hideFooter = $derived($page.url.pathname.startsWith("/login") || $page.url.pathname.startsWith("/register"));
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<LandingHeader {user} />
<Nostr />
<main class="container flex px-4 md:px-40 mx-auto min-h-[600px]" data-theme={theme}>
  {@render children?.()}
</main>
{#if !hideFooter}
  <Footer />
{/if}
