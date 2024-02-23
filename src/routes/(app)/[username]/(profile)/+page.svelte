<script>
  import { browser } from "$app/environment";
  import { goto, invalidate } from "$app/navigation";
  import { btc, f, sat, post } from "$lib/utils";
  import { onMount } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import DeleteItem from "$comp/DeleteItem.svelte";
  import { t } from "$lib/translations";
  import { fade } from "svelte/transition";
  import { cubicIn } from "svelte/easing";
  import { flip } from "svelte/animate";

  import {
    dndzone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    SOURCES,
    TRIGGERS,
  } from "svelte-dnd-action";

  export let data;

  let flipDurationMs = 200;
  let dropTargetStyle = {};

  let { subject, user, items, rates } = data;
  $: ({ currency } = subject);
  $: rate = rates[currency];
  $: refresh(data);
  let refresh = (d) => ({ items, subject, user, rates } = d);
  let dragDisabled =
    subject?.id !== user?.id || (browser && window.innerWidth < 768);

  let deleting;
  $: total = items.reduce((a, b) => a + b.price * b.quantity, 0);
  let del = (item) => {
    deleting = item;
  };

  function handleConsider(e) {
    const {
      items: newItems,
      info: { source, trigger },
    } = e.detail;
    items = newItems;
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED)
      reset();
  }

  async function handleFinalize(e) {
    const {
      items: newItems,
      info: { source },
    } = e.detail;
    items = newItems;
    if (source === SOURCES.POINTER) reset();

    if (subject?.id === user?.id) {
      await post("/api/items/sort", { items });
      invalidate("app:items");
    }
  }

  function startDrag(e) {
    e.preventDefault();
    dragDisabled = false;
  }

  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === " ") && dragDisabled)
      dragDisabled = false;
  }

  $: if (total > 0 && browser) {
    let payButton = document.querySelector("#payButton");
    if (payButton) payButton.addEventListener("click", checkout);
  }

  let checkout = async () => {
    let invoice = {
      type: "lightning",
      amount: btc(total, rate),
      currency,
      items: items.filter((i) => i.quantity > 0),
      prompt: subject.prompt,
      memoPrompt: subject.memoPrompt,
      rate,
    };

    let { id } = await post(`/${subject.username}/invoice`, {
      invoice,
      user: { username: subject.username },
    });

    goto(`/send/invoice/${id}`, { invalidateAll: true });
  };

  let reset = () =>
    (dragDisabled =
      user?.username !== subject?.username || window.innerWidth < 768);
</script>

<svelte:window on:resize={reset} />

{#if deleting}
  <DeleteItem bind:item={deleting} />
{/if}

<div class="space-y-5">
  {#if user?.id === subject.id}
    <div class="flex justify-center lg:justify-start">
      <Balance {user} {rate} />
    </div>

    {#if !user.balance}
      <div class="mb-8">
        <p class="text-secondary text-lg">
          {$t("user.welcome")}
        </p>
      </div>
    {/if}

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

      <a href={`/${user.username}/receive`} class="contents">
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow"
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="numpad" style="w-8" />
            <div class="my-auto">{$t("user.dashboard.receive")}</div>
          </div>
        </button>
      </a>

      {#if user?.username === subject.username}
        <a href={`/${user.username}/items/create`} class="contents">
          <button
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-primary grow basis-full"
          >
            <div class="mx-auto flex gap-2">
              <Icon icon="plus" style="w-8 mx-auto" />
              <div class="my-auto text-xl whitespace-nowrap">
                {$t("items.add")}
              </div>
            </div>
          </button>
        </a>
      {/if}
    </div>
  {/if}

  <div
    class="grid sm:grid-cols-2 gap-4"
    class:pb-20={total > 0}
    use:dndzone={{ items, flipDurationMs, dropTargetStyle, dragDisabled }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
  >
    {#each items as i (i.id)}
      <button
        type="button"
        class="w-full text-center cursor-pointer hover:opacity-80 mb-auto"
        on:click={() => i.quantity++}
      >
        <div class="relative w-full h-64 overflow-hidden rounded-xl">
          {#if i[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
            <div
              in:fade={{ duration: 200, easing: cubicIn }}
              class="custom-shadow-item"
            />
          {:else if i.image}
            <img
              src={`/api/public/${i.image}.webp`}
              alt={i.name}
              class="mx-auto object-cover h-full w-full"
            />
          {:else}
            <div
              class="bg-gradient-to-r from-primary to-gradient mb-4 cursor-pointer hover:opacity-80 w-full h-full"
              alt="Banner"
            />
          {/if}
          {#if user?.username === subject.username}
            <div class="flex gap-2 justify-center absolute top-2 right-2">
              <button type="button" on:click|stopPropagation={() => {}}>
                <a href={`/${user.username}/items/${i.id}`}>
                  <button
                    class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                  >
                    <Icon icon="edit" style="w-8 mx-auto invert" />
                  </button>
                </a>
              </button>
              <button
                class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                on:click|stopPropagation={() => del(i)}
              >
                <Icon icon="trash" style="w-8 mx-auto invert" />
              </button>
              <button
                type="button"
                on:click|stopPropagation={() => {}}
                class="sm:hidden"
                on:mousedown={startDrag}
                on:touchstart={startDrag}
                on:keydown={handleKeyDown}
              >
                <a href={`/${user.username}/items/${i.id}`}>
                  <button
                    class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                  >
                    <Icon icon="move" style="w-8 mx-auto invert" />
                  </button>
                </a>
              </button>
            </div>
          {/if}
        </div>
        <div class="bg-white rounded-xl py-2">
          <div class="flex text-left gap-2">
            <div class="overflow-hidden space-y-1">
              <div class="text-2xl break-words">{i.name}</div>
              <div class="flex gap-2">
                <div class="font-semibold text-lg">
                  {f(i.price, currency)}
                </div>
                <div class="text-secondary my-auto">
                  {sat(btc(i.price, rate))}
                </div>
              </div>
            </div>
            <div class="flex gap-1 ml-auto mb-auto justify-around tabular-nums">
              {#if i.quantity}
                <button
                  type="button"
                  on:click|stopPropagation={() =>
                    i.quantity > 0 && i.quantity--}
                >
                  <Icon icon="minus" style="w-10 min-w-10" />
                </button>
              {/if}
              <div class="text-2xl my-auto text-center">
                {#if i.quantity}{i.quantity}{:else}&mdash;{/if}
              </div>
              {#if i.quantity}
                <button
                  type="button"
                  on:click|stopPropagation={() => i.quantity++}
                >
                  <Icon icon="plus" style="w-10 min-w-10" />
                </button>
              {/if}
            </div>
          </div>
        </div>
      </button>
    {/each}
  </div>
  {#if total > 0}
    <button
      class="rounded-2xl py-5 px-6 font-bold hover:opacity-80 flex bg-black text-white fixed bottom-16 right-4"
      on:click={checkout}
    >
      <div class="mx-auto flex">
        <div class="my-auto text-2xl">
          {$t("user.dashboard.checkout")}
          {f(total, currency)}
          <span class="text-base">
            {sat(btc(total, rate), currency)}
          </span>
        </div>
      </div>
    </button>
  {/if}
</div>

<style>
  .custom-shadow-item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    background: #333;
    opacity: 0.5;
    margin: 0;
  }
</style>
