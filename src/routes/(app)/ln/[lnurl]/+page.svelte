<script lang="ts">
  import Lnurlp from "$comp/Lnurlp.svelte";
  import Lnurlw from "$comp/Lnurlw.svelte";
  let { data, form } = $props();
  let tag = $derived(data.tag);
</script>

{#if tag === "payRequest"}
  <Lnurlp {data} {form} />
{:else if tag === "withdrawRequest"}
  <Lnurlw {data} {form} />
{/if}
