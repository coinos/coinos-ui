<script>
  import { scale } from "svelte/transition";
  import Icon from "$comp/Icon.svelte";

  export let data;
  let { subject } = data;
</script>

<div class="container px-4 text-center mx-auto">
  <div
    class="flex w-full py-20 max-w-[200px] mx-auto"
    in:scale={{ start: 0.5 }}
  >
    <Icon icon="check" style="mx-auto" />
  </div>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">Request sent</h1>
</div>

<a href={`/${subject.username}`}>
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50" />
</a>
