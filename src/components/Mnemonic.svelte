<script>
  export let mnemonic;
</script>

<div
  class="text-lg border p-4 rounded-2xl text-secondary grid xss:grid-flow-col xss:grid-rows-6 xss:grid-cols-2 grid-cols-3 gap-2 justify-items-center whitespace-nowrap w-full"
>
  {#each mnemonic.split(" ") as w, i}
    <div class="flex gap-1">
      <div class="select-none text-xs text-black my-auto">{i + 1}</div>
      <div class="my-auto">{@html w === "-" ? "&mdash;" : w}</div>
    </div>
  {/each}
</div>
