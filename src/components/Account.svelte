<script>
  import { run } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  let { user, rate, account, last } = $props();
  let { name, seed, balance, id } = $derived(account);

  let setAccount = () => (document.cookie = `aid=${id}; path=/; max-age=86400`);
  let go = () => {
    setAccount();
    goto("/payments");
  };
  let type = $derived(seed ? "Savings" : "Cash");
</script>

<div
  class="block space-y-2 border-primary py-4"
  class:border-b-8={!last}
  aria-label="Payments"
>
  <div class="flex">
    <Balance {balance} {user} {rate} {id} />
    {#if id !== user.id}
      <a
        href={id === user.id ? "/settings/nostr" : `/account/${id}`}
        class="contents"
        aria-label="Settings"
      >
        <button class="flex gap-1 mb-auto pb-4 pl-4 ml-auto">
          <iconify-icon
            noobserver
            icon="ph:gear-bold"
            width="32"
            aria-label="Settings"
          ></iconify-icon>
        </button>
      </a>
    {/if}
  </div>

  <div class="flex justify-center w-full text-xl gap-2">
    <a href={"/invoice"} class="contents" onclick={setAccount}>
      <button class="btn !w-auto flex-grow">
        <iconify-icon
          noobserver
          icon="ph:hand-coins-bold"
          width="32"
          flip="horizontal"
        ></iconify-icon>
        <div class="my-auto">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <a href={`/send`} class="contents grow" onclick={setAccount}>
      <button type="button" class="btn !w-auto flex-grow">
        <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"
        ></iconify-icon>
        <div class="my-auto">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</div>
