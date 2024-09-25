<script>
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let user, rate, account;
  let { name, seed, balance, id } = account;
  $: type = seed ? "Savings" : "Cash";

  $: refresh(account);
  let refresh = (a) => ({ seed, balance, id } = a);

  let setAccount = () => (document.cookie = `aid=${id}; path=/; max-age=86400`);
</script>

<a
  href={`/payments`}
  class="px-2 space-y-5 border-b block last:border-none"
  on:click={setAccount}
>
  <div class="flex">
    <Balance {balance} {user} {rate} />
    {#if seed}
      <a href={`/account/${id}`} class="contents">
        <button class="ml-auto flex gap-1 mb-auto pb-4 pl-4">
          <Icon icon="settings" style="w-8 my-auto" />
        </button>
      </a>
    {/if}
  </div>

  <div class="flex justify-center w-full text-xl">
    <a href={`/invoice`} class="contents" on:click={setAccount}>
      <button class="py-5 px-4 hover:opacity-80 flex grow">
        <div class="mx-auto flex gap-2">
          <Icon icon="receive" style="w-8" />
          <div class="my-auto">{$t("user.dashboard.receive")}</div>
        </div>
      </button>
    </a>

    <a href={`/scan`} class="contents" on:click={setAccount}>
      <button class="py-5 px-4 hover:opacity-80 flex shrink">
        <div class="mx-auto flex gap-2">
          <Icon icon="camera" style="w-8" />
        </div>
      </button>
    </a>

    <a href={`/send`} class="contents grow" on:click={setAccount}>
      <button type="button" class="py-5 px-6 hover:opacity-80 flex grow">
        <div class="mx-auto flex gap-1">
          <Icon icon="send" style="w-8" />
          <div class="my-auto">{$t("user.dashboard.send")}</div>
        </div>
      </button>
    </a>
  </div>
</a>
