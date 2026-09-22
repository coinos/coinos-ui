<script>
  import Lnurlp from "$comp/Lnurlp.svelte";
  import Lnurlw from "$comp/Lnurlw.svelte";
  let { data, form } = $props();
  let { tag } = data;
</script>

<!-- form carries the action result; without it a failed pay/max/withdraw
     showed nothing and left the button spinning forever -->
{#if tag === "payRequest"}
  <Lnurlp {data} {form} />
{:else if tag === "withdrawRequest"}
  <Lnurlw {data} {form} />
{/if}
