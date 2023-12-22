<script>
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { back, fiat, f, s } from "$lib/utils";
  import { rate, pin } from "$lib/store";

  export let data;
  export let form;

  let { payreq } = $page.params;
  let {
    route,
    rates,
    user: { currency },
  } = data;
  let a;

  $: reload(data);
  let reload = (data) => {
    ({
      route,
      rates,
      user: { currency },
    } = data);
    if (!$rate) $rate = rates[currency];
  };

  $: amount = form?.amount || data.amount;

  let loading;
  let submit = () => (loading = true);
  $: update(form);
  let update = () => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  };

  let show;
  let toggle = () => (show = !show);

  let total = route.reduce((a, b) => a + b.fee, 0);
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
  <Icon icon="arrow-left" style="w-10" />
</button>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 max-w-xl mx-auto text-center space-y-5">
  {#if amount}
    <h1 class="text-xl md:text-2xl text-secondary mb-2">
      {$t("payments.send")}
    </h1>

    <p class="text-6xl break-words mb-4">
      ⚡️{s(amount)}
    </p>

    <h1 class="text-xl md:text-2xl text-secondary mb-2">
      {$t("payments.to")}
    </h1>

    <p class="text-4xl break-words">{route[route.length - 1].alias}</p>

    <h1 class="text-xl md:text-2xl text-secondary mb-2">
      {$t("payments.via")}
    </h1>

    <div class="text-xl grid grid-cols-2 space-y-2 text-left mx-auto">
      <div class="my-auto text-secondary">Node</div>
      <div class="my-auto text-secondary text-center">Fee</div>
      {#each route.slice(0, -1) as hop, i}
        <div class="my-auto text-2xl">{hop.alias}</div>
        <div class="mx-auto flex gap-2">
          <div>{f(fiat(hop.fee, $rate), currency)}</div>
          <div class="text-secondary text-lg">⚡️{hop.fee}</div>
        </div>
      {/each}
      <div class="my-auto text-secondary pt-4">Total</div>
      <div class="mx-auto flex gap-2 font-bold pt-4">
        <div>{f(fiat(total, $rate), currency)}</div>
        <div class="text-secondary text-lg">⚡️{total}</div>
      </div>
    </div>

    <form
      method="POST"
      use:enhance
      on:submit={submit}
      action="?/send"
      class="space-y-5"
    >
      <input name="payreq" value={payreq} type="hidden" />
      <input name="amount" value={amount} type="hidden" />
      <input name="route" value={JSON.stringify(route)} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />

      <div class="flex w-full">
        <button
          type="submit"
          class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
          disabled={loading}
        >
          {#if loading}
            <Spinner />
          {:else}
            {$t("payments.send")}
          {/if}
        </button>
      </div>
    </form>
  {:else}
    <form
      method="POST"
      action="?/setAmount"
      class="w-[300px] mx-auto"
      use:enhance
    >
      <input type="hidden" value={a} name="amount" />
      <Numpad bind:amount={a} {currency} bind:rate={$rate} />
      <button
        type="submit"
        class="bg-black text-white rounded-xl h-[48px] flex w-full justify-center items-center font-semibold
				opacity-100 hover:opacity-80"
      >
        Next
      </button>
    </form>
  {/if}
</div>
