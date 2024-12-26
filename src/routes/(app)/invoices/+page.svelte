<script>
  let { data } = $props();
  let { invoices } = $derived(data);
</script>

{invoices.length}
{#each invoices as i}
  {JSON.stringify(i)}
{/each}
