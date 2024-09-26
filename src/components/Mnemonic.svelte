<script>
  export let mnemonic;
</script>

<div class="flex w-full border p-4 rounded-2xl h-full">
  <div
    class="text-secondary grid grid-flow-col grid-rows-6 sm:grid-rows-none grid-cols-2 sm:grid-cols-3 sm:grid-flow-row gap-x-8 gap-y-2 justify-center whitespace-nowrap m-auto"
  >
    {#each mnemonic.split(" ") as w, i}
      <div>
        <span class="select-none text-black">{i + 1}.</span>
        <span>{@html w === "-" ? "&mdash;" : w}</span>
      </div>
    {/each}
  </div>
</div>
