<script lang="ts">
  import LandingHeader from "$comp/LandingHeader.svelte";
  let { data, children } = $props();
</script>

<LandingHeader />
<main class="container px-10 md:px-40 mx-auto min-h-[600px] pb-20">
  {@render children?.()}
</main>
