<script>
  import Nostr from "$comp/Nostr.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import Footer from "$comp/Footer.svelte";
  import LandingHeader from "$comp/LandingHeader.svelte";
  import { theme as themeStore } from "$lib/store";

  let { data, children } = $props();
  let user = $derived(data.user);
  let theme = $state();
  $effect(() => {
    theme = $themeStore;
  });
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<LandingHeader {user} />
<Nostr />
<main
  class="container flex px-4 md:px-40 mx-auto min-h-[600px]"
  data-theme={theme}
>
  {@render children?.()}
</main>
<Footer />
