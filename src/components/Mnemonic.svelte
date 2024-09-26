<script>
  export let mnemonic;
</script>

<div
  class="text-lg border p-4 rounded-2xl text-secondary grid grid-flow-col grid-rows-6 grid-cols-2 sm:grid-cols-3 sm:grid-flow-row gap-2 justify-items-center whitespace-nowrap w-full"
>
  {#each mnemonic.split(" ") as w, i}
    <div class="flex gap-1">
      <div class="select-none text-xs text-black my-auto">{i + 1}</div>
      <div class="my-auto">{@html w === "-" ? "&mdash;" : w}</div>
    </div>
  {/each}
</div>
