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
    alias,
    rates,
    user: { currency },
  } = data;
  let a;

  $: reload(data);
  let reload = (data) => {
    ({
      alias,
      rates,
      user: { currency },
    } = data);
    if (!$rate) $rate = rates[currency];
  };

  $: amount = form?.amount || data.amount;
  $: maxfee =
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
      : amount * 0.01;

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
    <h1 class="text-4xl mb-2 font-semibold">
      {$t("payments.send")}
    </h1>

    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-semibold">
        {f(fiat(amount, $rate), currency)}
      </h2>
      <h3 class="text-secondary md:text-lg mb-6 mt-1">⚡️{s(amount)}</h3>
    </div>

    <h1 class="text-xl md:text-xl text-secondary mb-2">
      {$t("payments.to")}
    </h1>

    <p class="text-4xl break-words">{alias}</p>

    <form
      method="POST"
      use:enhance
      on:submit={submit}
      action="?/send"
      class="space-y-5"
    >
      <input name="payreq" value={payreq} type="hidden" />
      <input name="amount" value={amount} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />

      <div class="relative w-40 mx-auto text-left">
        <label for="maxfee" class="text-xl text-secondary"
          >{$t("payments.maxfee")}</label
        >
        <input name="maxfee" bind:value={maxfee} class="text-lg" />

        <div
          class="absolute right-[2px] top-[25px] text-gray-600 rounded-r-2xl p-4 h-[54px] my-auto border-l"
        >
          ⚡️
        </div>
      </div>

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
