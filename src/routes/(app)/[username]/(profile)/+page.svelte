<script>
  import { btc, f, sat } from "$lib/utils";
  import { onMount } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import DeleteItem from "$comp/DeleteItem.svelte";
  import { t } from "$lib/translations";

  export let data;
  let { subject, user, items, rates } = data;
  $: refresh(data);
  let refresh = (d) => ({ items, subject, user, rates } = d);

  let deleting;
  $: total = items.reduce((a, b) => a + b.price * b.quantity, 0);
  let del = (item) => {
    deleting = item;
  };
</script>

{#if deleting}
  <DeleteItem bind:item={deleting} />
{/if}

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

  <div class="grid grid-cols-2 gap-4">
    {#each items as i}
      <div
        class="w-full text-center cursor-pointer hover:opacity-80"
        on:click={() => i.quantity++}
      >
        <div class="relative w-full h-64 overflow-hidden rounded-xl">
          {#if i.image}
            <img
              src={`/api/public/${i.image}.webp`}
              alt={i.name}
              class="mx-auto object-cover h-full w-full"
            />
          {:else}
            <div
              class="bg-gradient-to-r from-primary to-gradient mb-4 cursor-pointer hover:opacity-80 w-full h-full"
              on:click={select}
              on:keydown={select}
              alt="Banner"
            />
          {/if}
          {#if user?.username === subject.username}
            <div class="flex gap-2 justify-center absolute top-2 right-2">
              <div
                on:click|stopPropagation={() => i.quantity > 0 && i.quantity--}
              >
                <a href={`/${user.username}/items/${i.id}`}>
                  <button
                    class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                  >
                    <Icon icon="edit" style="w-8 mx-auto invert" />
                  </button>
                </a>
              </div>
              <button
                class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                on:click|stopPropagation={() => del(i)}
              >
                <Icon icon="trash" style="w-8 mx-auto invert" />
              </button>
            </div>
          {/if}
        </div>
        <div class="bg-white rounded-xl p-2">
          <div class="flex">
            <div class="text-2xl mr-auto">{i.name}</div>
            <div class="flex gap-2 my-auto">
              <div class="font-semibold">
                {f(i.price, subject.currency)}
              </div>
              <div class="text-secondary">
                {sat(btc(i.price, rates[subject.currency]))}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <div
               class="ml-auto"
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
</div>
