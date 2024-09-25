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

<a href={`/payments`} class="block space-y-2" on:click={setAccount}>
  <div class="flex">
    <Balance {balance} {user} {rate} />
      <a href={`/payments`} class="contents" on:click={setAccount}>
        <button class="ml-auto flex gap-1 mb-auto pb-4 pl-4">
          <Icon icon="clock" style="w-8 my-auto" />
        </button>
      </a>
    {#if seed}
      <a href={`/account/${id}`} class="contents">
        <button class="flex gap-1 mb-auto pb-4 pl-4">
          <Icon icon="settings" style="w-8 my-auto" />
        </button>
      </a>
    {/if}
  </div>

  <div class="flex justify-center w-full text-lg gap-2">
    <a href={`/invoice`} class="contents" on:click={setAccount}>
      <button class="py-3 px-4 hover:opacity-80 flex grow border rounded-2xl">
        <div class="mx-auto flex gap-2">
          <Icon icon="receive" style="w-8" />
          <div class="my-auto">{$t("user.dashboard.receive")}</div>
        </div>
      </button>
    </a>

    <a href={`/send`} class="contents grow" on:click={setAccount}>
      <button
                      type="button"
                      class="py-3 px-4 hover:opacity-80 flex grow border rounded-2xl"
                      >
                      <div class="mx-auto flex gap-1">
                        <Icon icon="send" style="w-8" />
                        <div class="my-auto">{$t("user.dashboard.send")}</div>
                      </div>
      </button>
    </a>
  </div>
</a>
