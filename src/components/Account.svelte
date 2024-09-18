<script>
  import { account as acc } from "$lib/store";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let user, rate, account;
  let { name, seed, balance, id } = account;
  $: type = seed ? "Savings" : "Cash";

  $: refresh(account);
  let refresh = (a) => ({ seed, balance, id } = a);

  let setAccount = () =>
    (document.cookie = `account=${id}; path=/; max-age=86400`);
</script>

<a href={`/payments`} class="block" on:click={setAccount}>
  <div class="border rounded-xl shadow p-4 space-y-5">
    <div class="flex">
      <Balance {balance} {user} {rate} />
      <a href={`/account/${id}`} class="contents">
        <button class="ml-auto flex gap-1 mb-auto pb-2 pl-2">
          <div class="my-auto text-secondary">{name}</div>
          <Icon icon="settings" style="w-8 my-auto" />
        </button>
      </a>
    </div>

    <div class="flex flex-wrap gap-3 justify-center w-full text-xl">
      <a href={`/send`} class="contents grow" on:click={setAccount}>
        <button
          type="button"
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow"
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="send" style="w-8" />
            <div class="my-auto">{$t("user.dashboard.send")}</div>
          </div>
        </button>
      </a>

      <a href={`/invoice?account=${id}`} class="contents" on:click={setAccount}>
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow"
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="receive" style="w-8" />
            <div class="my-auto">{$t("user.dashboard.receive")}</div>
          </div>
        </button>
      </a>
    </div>
  </div>
</a>
