<script>
  import { browser } from "$app/environment";
  import { goto, invalidate } from "$app/navigation";
  import { btc, f, sat, post } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import Balance from "$comp/Balance.svelte";
  import DeleteItem from "$comp/DeleteItem.svelte";
  import { t } from "$lib/translations";
  import { fade } from "svelte/transition";
  import { cubicIn } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { installPrompt } from "$lib/store";

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

    if (invoice.memoPrompt) {
      return goto(`/${subject.username}/invoice/${id}/memo`);
    }
    if (user) goto(`/send/invoice/${id}`, { invalidateAll: true });
    else goto(`/${subject.username}/invoice/${id}`);
  };

  let reset = () =>
    (dragDisabled =
      user?.username !== subject?.username || window.innerWidth < 768);

  let install = async () => {
    if (!$installPrompt) return;
    await $installPrompt.prompt();
    $installPrompt = null;
  };
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

      {#if $installPrompt}
        <button
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-black text-white grow basis-full fixed bottom-16 xl:hidden"
          on:click={install}
        >
          <div class="mx-auto flex gap-2">
            <Icon icon="save" style="w-8 mx-auto invert" />
            <div class="my-auto text-xl whitespace-nowrap">{$t("user.install")}</div>
          </div>
        </button>
      {/if}
    </div>
  {/if}

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
