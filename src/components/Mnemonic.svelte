<script>
  let { mnemonic } = $props();
</script>

<div class="card w-full">
  <div
    class="card-body w-full text-secondary grid grid-flow-col grid-rows-6 sm:grid-rows-none grid-cols-2 sm:grid-cols-3 sm:grid-flow-row gap-x-8 gap-y-2 justify-center justify-items-center whitespace-nowrap text-xl"
  >
    {#each mnemonic.split(" ") as w, i}
      <div class="flex items-center gap-2 w-full max-w-[10rem] justify-start">
        <span class="select-none text-sm w-6 text-left">{i + 1}.</span>
        <span class="text-left">
          {@html w === "-" ? "&mdash;" : w}
        </span>
      </div>
    {/each}
  </div>
</div>
