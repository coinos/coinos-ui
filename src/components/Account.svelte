<script>
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let user, rate, account;
  let { balance, setup, type } = account;
</script>

<div class="border rounded-xl shadow p-4 space-y-5">
  <div class="flex justify-center lg:justify-start">
    <Balance {balance} {user} {rate} />
    <div class="ml-auto text-secondary">{type}</div>
  </div>

  <div class="flex flex-wrap gap-3 justify-center w-full text-xl">
    {#if setup}
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

      <a href={`/${user.username}/receive`} class="contents">
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow"
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="receive" style="w-8" />
            <div class="my-auto">{$t("user.dashboard.receive")}</div>
          </div>
        </button>
      </a>
    {:else}
      <a href={`/${user.username}/account/setup`} class="contents">
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow"
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="settings" style="w-8" />
            <div class="my-auto">{$t("user.dashboard.setup")}</div>
          </div>
        </button>
      </a>
    {/if}
  </div>
</div>
