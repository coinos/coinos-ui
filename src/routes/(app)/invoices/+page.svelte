<script>
  let { data } = $props();
  let { invoices } = $derived(data);
  let show = $state({});
  let display = (id) => (show[id] = true);
</script>

<div class="container w-full mx-auto text-lg px-2 space-y-2">
  <div class="mx-auto flex justify-center w-full gap-1">
    <div
      class="grid md:grid-cols-12 w-full text-center text-lg break-all gap-x-2"
    >
      {#each invoices as i}
        <div class="md:col-span-2 whitespace-nowrap mt-8 md:mt-0">{i.type}</div>
        {#if show[i.id]}
          <div class="md:col-span-8">{i.hash}</div>
        {:else}
          <div
            class="cursor-pointer grow md:col-span-6"
            onclick={() => display(i.id)}
          >
            {i.hash.substr(0, 12)}
            {#if !show[i.id]}...{/if}
          </div>
        {/if}
        <div class="md:col-span-2 whitespace-nowrap">
          {i.received} / {i.amount}
        </div>
        <div class="whitespace-nowrap">
          {i.memo?.startsWith("[") ? JSON.parse(i.memo)[0][1] : i.memo}
        </div>
      {/each}
    </div>
  </div>
</div>
