<script>
  import LandingHeader from "$comp/LandingHeader.svelte";
  export let data;
  let { user } = data;
</script>

<LandingHeader {user} />
<main class="container px-10 md:px-40 mx-auto min-h-[600px] pb-20">
  <slot />
</main>
