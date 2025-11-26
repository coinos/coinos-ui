<script>
  import { onMount, tick } from "svelte";
  import { HDKey } from "@scure/bip32";
  import { wallet } from "$lib/ark";

  let loading = $state();
  let balance = $state();

  onMount(async () => {
    setTimeout(checkBalance, 1000);
  });

  let checkBalance = async (e) => {
    e?.preventDefault();
    loading = true;

    balance = await wallet().getBalance();

    loading = false;
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Ark</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if loading}
      <div>
        <div class="loading loading-spinner"></div>
      </div>
    {:else if typeof balance !== "undefined"}
      <div class="flex items-center gap-2">
        <div>
          {balance.available} sats
        </div>
      </div>
    {/if}

    <div class="flex gap-2 justify-center w-full">
      <a href="/receive" class="btn grow">Receive</a>
      <a href="/send" class="btn grow">Send</a>
    </div>
  </div>
</div>
