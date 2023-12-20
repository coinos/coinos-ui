<script>
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Toggle from "$comp/Toggle.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { fiat as toFiat, f, back, s, sat, closest } from "$lib/utils";
  import { pin } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { rate } from "$lib/store";

  export let data;
  export let form;

  let { amount, address, fee, fees, feeRate, ourfee, rates, hex } = data;

  $: reload(data);
  let reload = () => {
    ({ amount, address, fee, fees, feeRate, ourfee, rates, hex } = data);
    feeRate = closest(Object.values(fees), feeRate);
    if (!$rate) $rate = rates[currency];
  };

  let { balance, currency } = data.user;
  let submitting, submit, showSettings;

  let feeNames = {
    fastestFee: "Fastest",
    halfHourFee: "Fast",
    hourFee: "Medium",
    economyFee: "Slow",
    minimumFee: "Slowest",
  };

  let toggleSettings = () => (showSettings = !showSettings);

  $: update(form);
  let update = () => {
    submitting = false;
    if (form?.message?.includes("pin")) $pin = undefined;
  };

  let setFee = () => goto(`/send/bitcoin/${address}/${amount}/${feeRate}`);
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
  <Icon icon="arrow-left" style="w-10" />
</button>

<div
  class="container px-4 max-w-xl mx-auto space-y-5 text-center no-transition"
>
  {#if form?.message}
    <div class="mb-5">
      <div class="text-red-600">{form.message}</div>
    </div>
  {/if}

  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  <div class="text-xl text-secondary break-all">{address}</div>

  <div class="text-center">
    <h2 class="text-2xl md:text-3xl font-semibold">
      {f(toFiat(amount, $rate), currency)}
    </h2>
    <h3 class="text-secondary md:text-lg mb-6 mt-1">⚡️{s(amount)}</h3>
  </div>

  <div class="text-center">
    <h2 class="text-secondary text-lg">{$t("payments.networkFee")}</h2>

    <div class="flex flex-wrap gap-4 justify-center">
      <select
        bind:value={feeRate}
        on:change={setFee}
        class="border text-lg bg-white p-4 rounded-2xl text-center my-auto"
      >
        {#each Object.keys(fees) as feeName}
          <option value={fees[feeName]}
            >{feeNames[feeName]} &mdash; ⚡️{fees[feeName]}/vb</option
          >
        {/each}
      </select>
      <div class="my-auto">
        <h2 class="text-xl">
          {f(toFiat(fee, $rate), currency)}
        </h2>
        <h3 class="text-secondary">⚡️{s(fee)}</h3>
      </div>
    </div>
  </div>

  <div class="text-center">
    <h2 class="text-secondary text-lg">{$t("payments.ourFee")}</h2>

    <div class="flex flex-wrap gap-4 justify-center">
      <div class="my-auto">
        <h2 class="text-xl">
          {f(toFiat(ourfee, $rate), currency)}
        </h2>
        <h3 class="text-secondary">⚡️{s(ourfee)}</h3>
      </div>
    </div>
  </div>

  <form method="POST" use:enhance on:submit={() => (submitting = true)}>
    <input name="pin" value={$pin} type="hidden" />
    <input name="hex" value={hex} type="hidden" />
    <input name="rate" value={$rate} type="hidden" />

    <div class="flex justify-center gap-2">
      <button
        bind:this={submit}
        type="submit"
        class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24"
        disabled={submitting}
      >
        {#if submitting}
          <Spinner />
        {:else}
          {$t("payments.send")}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .no-transition {
    view-transition-name: fee;
  }
</style>
