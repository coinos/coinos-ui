<script>
  let { data } = $props();
  let { invoices } = $derived(data);
  let show = $state({});
  let display = (id) => (show[id] = true);
</script>

<div class="container w-full mx-auto text-lg px-2 space-y-2">
  <div class="mx-auto flex justify-center w-full gap-1">
    <div class="grid grid-cols-12 w-full text-center text-lg break-all gap-2">
      {#each invoices as i}
        <div class="col-span-2 whitespace-nowrap">{i.type}</div>
        {#if show[i.id]}
          <div class="col-span-8">{i.hash}</div>
        {:else}
          <div class="cursor-pointer grow col-span-8" onclick={() => display(i.id)}>
            {i.hash.substr(0, 12)}
          </div>
        {/if}
        <div class="col-span-2 whitespace-nowrap">{i.received} / {i.amount}</div>
      {/each}
    </div>
  </div>
</div>
