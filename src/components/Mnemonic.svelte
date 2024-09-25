<script>
  export let mnemonic;
</script>

<div
  class="text-lg border p-4 rounded-2xl text-secondary grid grid-cols-3 gap-2 justify-center"
>
  {#each mnemonic.split(" ") as w, i}
    <div>
      <span class="select-none text-sm text-black">{i + 1}.</span>
      <span>{@html w === "-" ? "&mdash;" : w}</span>
    </div>
  {/each}
</div>
