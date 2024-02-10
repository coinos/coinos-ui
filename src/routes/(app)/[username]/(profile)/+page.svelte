<script>
  import { onMount } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let data;
  let { subject, user, rates } = data;
  $: refresh(data);
  let refresh = (d) => ({ subject, user, rates } = d);
</script>

<div class="space-y-5">
  {#if user?.id === subject.id}
    <div class="space-y-5">
      <div class="flex justify-center lg:justify-start">
        <Balance {user} rate={rates[user.currency]} />
      </div>

      {#if !user.balance}
        <div class="mb-8">
          <p class="text-secondary text-lg">
            {$t("user.welcome")}
          </p>
        </div>
      {/if}

      <div class="flex flex-wrap sm:flex-nowrap gap-3 justify-center w-full text-xl">
        <a href={`/send`} class="w-full">
          <button
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-full bg-primary"
          >
            <div class="mx-auto flex">
              <Icon icon="send" style="my-auto h-6 mr-2" />
              <div class="my-auto">{$t("user.dashboard.send")}</div>
            </div>
          </button>
        </a>

        <a href={`/${user.username}/receive`} class="w-full">
          <button
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-full bg-primary"
          >
            <div class="mx-auto flex">
              <Icon icon="numpad" style="my-auto h-6 mr-2" />
              <div class="my-auto">{$t("user.dashboard.receive")}</div>
            </div>
          </button>
        </a>
      </div>
    </div>
  {/if}
</div>
