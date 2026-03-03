<script lang="ts">
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import { copyNoNewlines as copy } from "$lib/utils";
  import samples from "$lib/samples";
  let { sample } = $props();
</script>

{#snippet cp(something)}
  <button type="button" class="ml-auto" onclick={() => copy(something)} aria-label="Copy value">
    <PhCopyBold width="42" />
  </button>
{/snippet}

<div
  class="bg-primary text-primary-content rounded-lg p-4 flex gap-4 whitespace-pre-wrap font-mono items-center"
>
  <div
    class="overflow-x-scroll max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
  >
    <div class="break-all min-w-[800px]">{samples[sample]}</div>
  </div>
  {@render cp(samples[sample])}
</div>
