<script>
  import { btc, f, sat, post } from "$lib/utils";
  import { browser } from "$app/environment";
  import { goto, invalidate } from "$app/navigation";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";

  export let data;

  let flipDurationMs = 200;
  let dropTargetStyle = {};

  let { subject, user, items, rates } = data;
  $: ({ currency } = subject);
  $: rate = rates[currency];
  $: refresh(data);
  let refresh = (d) => ({ items, subject, user, rates } = d);

  let deleting;
  $: total = items.reduce((a, b) => a + b.price * b.quantity, 0);
  let del = (item) => {
    deleting = item;
  };

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
</script>

<div class="space-y-5">
  <div
    class="grid sm:grid-cols-2 gap-4"
    class:pb-20={total > 0}
  >
    {#each items as i (i.id)}
      <button
        type="button"
        class="w-full text-center cursor-pointer hover:opacity-80 mb-auto"
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
              alt="Banner"
            />
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
