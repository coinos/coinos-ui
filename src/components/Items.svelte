<script>
  import { run, stopPropagation } from 'svelte/legacy';

  import { t } from "$lib/translations";
  import { btc, f, sat, post } from "$lib/utils";
  import { browser } from "$app/environment";
  import { goto, invalidate } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { cubicIn } from "svelte/easing";
  import { flip } from "svelte/animate";
  import {
    dndzone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    SOURCES,
    TRIGGERS,
  } from "svelte-dnd-action";
  import DeleteItem from "$comp/DeleteItem.svelte";
  import Icon from "$comp/Icon.svelte";

  let {
    subject,
    user,
    items = $bindable(),
    rate,
    currency,
    total
  } = $props();

  let flipDurationMs = 200;
  let dropTargetStyle = {};

  let dragDisabled =
    $state(subject?.id !== user?.id || (browser && window.innerWidth < 768));

  let deleting = $state();
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

    let { id } = await post(`/invoice`, {
      invoice,
      user: { username: subject.username },
    });

    if (invoice.memoPrompt) {
      return goto(`/invoice/${id}/memo`);
    }
    goto(`/invoice/${id}`);
  };

  let reset = () =>
    (dragDisabled =
      user?.username !== subject?.username || window.innerWidth < 768);
  run(() => {
    if (total > 0 && browser) {
      let payButton = document.querySelector("#payButton");
      if (payButton) payButton.addEventListener("click", checkout);
    }
  });
</script>

<svelte:window onresize={reset} />

{#if deleting}
  <DeleteItem bind:item={deleting} />
{/if}

{#if items.length}
  <h2 class="text-2xl font-bold">Select items</h2>
{/if}
<div
  class="grid sm:grid-cols-2 gap-4 pb-20"
  use:dndzone={{ items, flipDurationMs, dropTargetStyle, dragDisabled }}
  onconsider={handleConsider}
  onfinalize={handleFinalize}
>
  {#each items as i (i.id)}
    <button
      type="button"
      class="w-full text-center cursor-pointer hover:opacity-80 mb-auto"
      onclick={() => i.quantity++}
    >
      <div class="relative w-full h-64 overflow-hidden rounded-xl">
        {#if i[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
          <div
            in:fade={{ duration: 200, easing: cubicIn }}
            class="custom-shadow-item"
></div>
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
></div>
        {/if}
        {#if user?.username === subject.username}
          <div class="flex gap-2 justify-center absolute top-2 right-2">
            <a href={`/items/${i.id}`}>
              <button
                class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
              >
                <Icon icon="edit" style="w-8 mx-auto invert" />
              </button>
            </a>
            <button
              class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
              onclick={stopPropagation(() => del(i))}
            >
              <Icon icon="trash" style="w-8 mx-auto invert" />
            </button>
            <div
              onclick={stopPropagation(() => {})}
              class="sm:hidden"
              onmousedown={startDrag}
              ontouchstart={startDrag}
              onkeydown={handleKeyDown}
            >
              <a href={`/items/${i.id}`}>
                <button
                  class="bg-black rounded-full w-12 h-12 bg-opacity-40 hover:bg-opacity-100"
                >
                  <Icon icon="move" style="w-8 mx-auto invert" />
                </button>
              </a>
            </div>
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
                onclick={stopPropagation(() => i.quantity > 0 && i.quantity--)}
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
                onclick={stopPropagation(() => i.quantity++)}
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

<div
  class="fixed inset-x-0 mx-auto flex bottom-16"
  class:static={!items.length}
>
  {#if total > 0}
    <button
      class="rounded-2xl py-5 px-6 font-bold hover:bg-neutral-700 flex bg-black text-white mx-auto"
      onclick={checkout}
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
