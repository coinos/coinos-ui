<script>
  import { btc, f } from "$lib/utils";
  import { onMount } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import { t } from "$lib/translations";

  export let data;
  let { subject, user, rates } = data;
  $: refresh(data);
  let refresh = (d) => ({ subject, user, rates } = d);

  let items = [
    {
      id: 1,
      name: "Full Pour",
      price: 9,
      quantity: 0,
      hash: "fa3a9d22eb24b33ae2dee8d7566c1ce25d1c76e18b46d54437621d3e34a3fbc9",
    },
    {
      id: 2,
      name: "Half Pour",
      price: 6,
      quantity: 0,
      hash: "a79c7b921a0dde39076201ae5f24505d5faa5f12f0cfd3b9d86cbc9c77ab0bd1",
    },
    {
      id: 3,
      name: "Taster",
      price: 3,
      quantity: 0,
      hash: "9d8fe68d068f7271cf08d4cb9b033966984549c1bcd827f7516e66e5b537f502",
    },
    {
      id: 4,
      name: "4-packs",
      price: 18,
      quantity: 0,
      hash: "13cf773ae51607e670c2a7c640aa5a1dc8b288554026de08370ed3da44e59493",
    },
  ];

  $: total = items.reduce((a, b) => a + b.price * b.quantity, 0);
  let del = () => {};
</script>

<div class="space-y-5">
  {#if user?.id === subject.id}
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

    <div
      class="flex flex-wrap sm:flex-nowrap gap-3 justify-center w-full text-xl"
    >
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
  {/if}

  <div class="grid grid-cols-2 gap-4">
    {#each items as i}
      <div
        class="w-full text-center cursor-pointer hover:opacity-80"
        on:click={() => i.quantity++}
      >
        <div class="relative w-full h-64 overflow-hidden rounded-xl">
          <img
            src={`/api/public/${i.hash}.webp`}
            alt={i.name}
            class="mx-auto object-cover h-full w-full"
          />
          {#if user?.username === subject.username}
            <div class="flex gap-2 justify-center absolute top-2 right-2">
              <div
                on:click|stopPropagation={() => i.quantity > 0 && i.quantity--}
              >
                <a href={`/${user.username}/items/${i.id}`}>
                  <button class="bg-white rounded-xl">
                    <Icon icon="edit" style="w-10" />
                  </button>
                </a>
              </div>
              <button class="bg-white rounded-xl">
                <Icon icon="trash" style="w-10" on:click={() => del(i)} />
              </button>
            </div>
          {/if}
        </div>
          <div class="bg-white rounded-xl p-2">
            <div class="text-2xl">
              {i.name} &mdash; {f(i.price, subject.currency)}
            </div>
            <div class="flex gap-2 justify-center">
              <div
                on:click|stopPropagation={() => i.quantity > 0 && i.quantity--}
              >
                <Icon icon="minus" style="w-10" />
              </div>
              <div class="text-2xl my-auto">{i.quantity}</div>
              <Icon icon="plus" style="w-10" />
            </div>
          </div>
      </div>
    {/each}
  </div>
  {#if total > 0}
    <div>
      <a
        href={`/send/${subject.username}/${total}/${subject.currency}`}
        class="w-full"
      >
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-full bg-black text-white"
        >
          <div class="mx-auto flex">
            <div class="my-auto text-2xl">
              {f(total, subject.currency)}
              {$t("user.dashboard.checkout")}
            </div>
          </div>
        </button>
      </a>
    </div>
  {/if}
  {#if user?.username === subject.username}
    <div>
      <a href={`/${user.username}/items/create`} class="w-full">
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-full bg-black text-white"
        >
          <div class="mx-auto flex">
            <div class="my-auto text-2xl">
              {$t("items.add")}
            </div>
          </div>
        </button>
      </a>
    </div>
  {/if}
</div>
