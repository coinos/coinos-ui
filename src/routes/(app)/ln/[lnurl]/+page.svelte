<script>
  import { Lnurlp, Lnurlw } from "$comp";
  export let data;
  let { tag } = data;
</script>

{#if tag === "payRequest"}
  <Lnurlp {data} />
{:else if tag === "withdrawRequest"}
  <Lnurlw {data} />
{/if}
