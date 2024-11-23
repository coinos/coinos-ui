<script>
  import { copyNoNewlines as copy } from "$lib/utils";
  import samples from "$lib/samples";
  let { sample } = $props();
</script>

<div
  class="bg-primary text-primary-content rounded-lg p-4 flex gap-4 whitespace-pre-wrap font-mono items-center"
>
  <div class="overflow-x-scroll max-w-full scrollbar-hide">
    <div class="break-all min-w-[800px]">{samples[sample]}</div>
  </div>
  <iconify-icon
    icon="ph:copy-bold"
    onclick={() => copy(samples[sample])}
    width="42"
    class="ml-auto cursor-pointer"
  ></iconify-icon>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* For IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
