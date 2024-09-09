<script>
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let user, rate, account;
  let { seed, balance, id } = account;
  $: type = seed ? "Savings":"Cash";
</script>

<a href={`/${user.username}/${id}/payments`.replace(/undefined\//, "")}>
  <div class="border rounded-xl shadow p-4 space-y-5">
    <div class="flex justify-center lg:justify-start">
      <Balance {balance} {user} {rate} />
      <div class="ml-auto text-right">
        <div>{type} account</div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 justify-center w-full text-xl">
      <a href={`/send`} class="contents grow">
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

      <a
        href={`/${user.username}/${id}/receive`.replace(/undefined\//, "")}
        class="contents"
      >
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
