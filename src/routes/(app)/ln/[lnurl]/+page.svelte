<script>
  import Lnurlp from "$comp/Lnurlp.svelte";
  import Lnurlw from "$comp/Lnurlw.svelte";
  export let data;
  let { tag } = data;
</script>

{#if tag === "payRequest"}
  <Lnurlp {data} />
{:else if tag === "withdrawRequest"}
  <Lnurlw {data} />
{/if}
