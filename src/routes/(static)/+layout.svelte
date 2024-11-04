<script>
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import Footer from "$comp/Footer.svelte";
  import { theme } from "$lib/store";
  import LandingHeader from "$comp/LandingHeader.svelte";

  export let data;
  $: ({ user } = data);
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />
<LandingHeader {user} />
<main
  class="container flex px-4 md:px-40 mx-auto min-h-[600px]"
  data-theme={$theme}
>
  <slot />
</main>
<Footer />
