<script>
  import { onMount } from "svelte";
  import { getBalance, getAddress, keyToNsec } from "$lib/ark";
  import Amount from "$comp/Amount.svelte";
  import { s, copy } from "$lib/utils";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { user, rate } = $derived(data);

  let loading = $state(true);
  let balance = $state({ available: 0, pending: 0 });
  let address = $state("");
  let showNsec = $state(false);
  let nsec = $state("");

  onMount(async () => {
    await refresh();
  });

  let refresh = async () => {
    loading = true;
    try {
      [balance, address] = await Promise.all([getBalance(), getAddress()]);
    } catch (e) {
      console.error("Failed to load ARK wallet:", e);
    }
    loading = false;
  };

  let revealNsec = () => {
    nsec = keyToNsec();
    showNsec = true;
  };

  let copyNsec = () => {
    copy(nsec);
  };
</script>

<div class="space-y-5">
  <div class="flex items-center justify-center gap-2">
    <iconify-icon noobserver icon="ph:vault-bold" width="32"></iconify-icon>
    <h1 class="text-3xl font-semibold">Ark Wallet</h1>
  </div>

  <div class="container w-full mx-auto px-4 max-w-xl space-y-5">
    {#if loading}
      <div class="flex justify-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    {:else}
      <div class="text-center space-y-2">
        <Amount
          amount={balance.available}
          {rate}
          currency={user?.currency || "USD"}
        />
        {#if balance.pending > 0}
          <div class="text-sm text-warning">
            +{s(balance.pending)} pending
          </div>
        {/if}
      </div>

      <div class="flex gap-2 justify-center w-full text-xl">
        <a href="/invoice" class="btn flex-grow">
          <iconify-icon noobserver icon="ph:hand-coins-bold" width="24" flip="horizontal"></iconify-icon>
          Receive
        </a>
        <a href="/send" class="btn flex-grow">
          <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="24"></iconify-icon>
          Send
        </a>
      </div>

      <button class="btn btn-ghost btn-sm w-full" onclick={refresh}>
        <iconify-icon noobserver icon="ph:arrows-clockwise-bold" width="20"></iconify-icon>
        Refresh
      </button>

      <div class="divider"></div>

      <div class="space-y-2">
        <div class="text-sm text-secondary">Your ARK Address</div>
        <div
          class="text-xs break-all bg-base-200 p-3 rounded-lg cursor-pointer hover:bg-base-300"
          onclick={() => copy(address)}
        >
          {address}
        </div>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-secondary">Backup Key</div>
        {#if showNsec}
          <div
            class="text-xs break-all bg-warning/20 p-3 rounded-lg cursor-pointer border border-warning"
            onclick={copyNsec}
          >
            {nsec}
          </div>
          <div class="text-xs text-warning">⚠️ Keep this secret! Anyone with this key can spend your funds.</div>
        {:else}
          <button class="btn btn-warning btn-sm" onclick={revealNsec}>
            <iconify-icon noobserver icon="ph:eye-bold" width="20"></iconify-icon>
            Reveal nsec
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>
