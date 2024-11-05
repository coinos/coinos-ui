<script>
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let user, rate, account, last;
  let { name, seed, balance, id } = account;
  $: type = seed ? "Savings" : "Cash";

  $: refresh(account);
  let refresh = (a) => ({ seed, balance, id } = a);

  let setAccount = () => (document.cookie = `aid=${id}; path=/; max-age=86400`);
</script>

<a
  href={`/payments`}
  class="block space-y-2 border-primary py-4"
  class:border-b-8={!last}
  on:click={setAccount}
>
  <div class="flex">
    <Balance {balance} {user} {rate} />
    <a href={`/payments`} class="contents" on:click={setAccount}>
      <button class="ml-auto flex gap-1 mb-auto pb-4 pl-4">
        <iconify-icon icon="ph:clock-bold" width="32" />
      </button>
    </a>
    <a href={`/account/${id}`} class="contents">
      <button class="flex gap-1 mb-auto pb-4 pl-4">
        <iconify-icon icon="ph:gear-bold" width="32" />
      </button>
    </a>
  </div>

  <div class="flex justify-center w-full text-xl gap-2">
    <a href={`/invoice`} class="contents" on:click={setAccount}>
      <button class="btn !w-auto flex-grow">
        <iconify-icon icon="ph:hand-coins-bold" width="32" flip="horizontal" />
        <div class="my-auto">{$t("user.dashboard.receive")}</div>
      </button>
    </a>

    <a href={`/send`} class="contents grow" on:click={setAccount}>
      <button type="button" class="btn !w-auto flex-grow">
        <iconify-icon icon="ph:paper-plane-right-bold" width="32" />
        <div class="my-auto">{$t("user.dashboard.send")}</div>
      </button>
    </a>
  </div>
</a>
