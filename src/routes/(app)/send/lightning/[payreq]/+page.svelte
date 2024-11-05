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
  $: maxfee = Math.round(amount * 0.01) || 1;
  let showMax;

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

      {#if form?.message || showMax}
        <div class="mx-auto space-y-2">
          <label for="maxfee" class="text-lg text-secondary"
            >{$t("payments.maxfee")}</label
          >

          <div class="text-secondary">
            {$t("payments.maxFeeDesc")}
          </div>

          <label
            class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2 text-left"
          >
            <input
              id="maxfee"
              name="maxfee"
              bind:value={maxfee}
              class="blank !grow"
            />
            <div class="ml-auto">⚡️</div>
          </label>
        </div>
      {/if}

      <button
        type="submit"
        class="btn btn-primary"
        disabled={loading}
        use:focus
      >
        {#if loading}
          <Spinner />
        {:else}
          {$t("payments.send")}
        {/if}
      </button>

      {#if !(form?.message || showMax)}
        <button type="button" class="btn" on:click={() => (showMax = !showMax)}
          >Advanced settings</button
        >
        <input name="maxfee" type="hidden" bind:value={maxfee} />
      {/if}
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
      <button type="submit" class="btn"> Next </button>
    </form>
  {/if}
</div>
