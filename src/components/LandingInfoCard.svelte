<script lang="ts">
  import Image from "./Image.svelte";

  import type { Snippet } from "svelte";
  let { image, title, description = undefined, order = undefined, children = undefined }: { image: string; title: string; description?: string; order?: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col-reverse lg:flex-row justify-center lg:space-x-20 items-center">
  <Image
    {image}
    style="w-2/3 md:w-5/12 lg:w-2/5 xl:w-1/3 2xl:w-1/4 max-w-xl mx-auto lg:mx-0 mt-10 lg:mt-0 {order ===
    'reverse' && 'lg:order-last'}"
  />
  <div class="w-full lg:w-1/2 max-w-3xl space-y-10 mx-auto lg:mx-0">
    <h3 class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]">{title}</h3>
    <p class="text-secondary text-xl font-medium w-full md:w-[500px] mx-auto lg:mx-0">
      {#if description}
        {description}
      {:else}
        {@render children?.()}
      {/if}
    </p>
  </div>
</div>
