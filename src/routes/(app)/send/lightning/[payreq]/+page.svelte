<script>
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { back, fiat, f, s, focus } from "$lib/utils";
  import { rate, pin } from "$lib/store";

  export let data;
  export let form;

  let { payreq } = $page.params;
  let {
    alias,
    ourfee,
    rates,
    user: { currency },
  } = data;
  let a;

  $: reload(data);
  let reload = (data) => {
    ({
      alias,
      ourfee,
      rates,
      user: { currency },
    } = data);
    if (!$rate) $rate = rates[currency];
  };

  $: amount = form?.amount || data.amount;
  $: maxfee = Math.round(
    amount < 100
      ? amount * 5
      : amount < 1000
      ? amount
      : amount < 10000
      ? amount * 0.5
      : amount < 100000
      ? amount * 0.1
      : amount < 1000000
      ? amount * 0.05
      : amount * 0.01
  );

  let loading;
  let submit = () => (loading = true);
  $: update(form);
  let update = () => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  };

  let show;
  let toggle = () => (show = !show);
</script>

<div class="container px-4 max-w-xl mx-auto text-center space-y-2">
  {#if amount}
    {#if form?.message}
      <div class="text-red-600 text-center">
        {$t(form.message)}
      </div>
    {/if}

    <div>
      <h1 class="text-lg text-secondary">
        {$t("payments.send")}
      </h1>

      <h2 class="text-3xl font-semibold">
        {f(fiat(amount, $rate), currency)}
      </h2>
      <h3 class="text-secondary text-xl">⚡️{s(amount)}</h3>
    </div>

    <div class="text-xl">
      <span class="text-secondary">{$t("payments.to")}</span>
      <span class="break-words font-semibold">{alias}</span>
    </div>

    {#if ourfee}
      <div class="text-center">
        <h2 class="text-secondary text-lg">{$t("payments.platformFee")}</h2>

        <div class="flex flex-wrap gap-4 justify-center">
          <div class="my-auto">
            <h2 class="text-xl">
              {f(fiat(ourfee, $rate), currency)}
            </h2>
            <h3 class="text-secondary">⚡️{s(ourfee)}</h3>
          </div>
        </div>
      </div>
    {/if}

    <form
      method="POST"
      use:enhance
      on:submit={submit}
      action="?/send"
      class="space-y-2"
    >
      <input name="payreq" value={payreq} type="hidden" />
      <input name="amount" value={amount} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />

      <div class="w-40 mx-auto">
        <label for="maxfee" class="text-lg text-secondary"
          >{$t("payments.maxfee")}</label
        >

        <div class="flex">
          <input
            id="maxfee"
            name="maxfee"
            bind:value={maxfee}
            class="border-r-0 rounded-r-none py-2"
          />
          <div
            class="text-gray-600 rounded-r-2xl p-4 my-auto rounded-l-none rounded border bg-gray-100"
          >
            ⚡️
          </div>
        </div>
      </div>

      <div class="flex w-full">
        <button
          type="submit"
          class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24 mx-auto"
          disabled={loading}
          use:focus
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
      <input name="rate" value={$rate} type="hidden" />

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
