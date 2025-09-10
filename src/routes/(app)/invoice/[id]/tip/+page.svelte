<script>
  import { untrack } from "svelte";

  import { browser } from "$app/environment";
  import { invoice as inv, request } from "$lib/store";
  import { loc, copy, focus, f, sat, get, s, sats } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import Slider from "$comp/Slider.svelte";
  import { goto } from "$app/navigation";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";

  const tipAmounts = ["No", "10%", "15%", "20%"];
  let showCustomAmount = $state();

  let customInput = $state();
  let customTipAmount = $state();

  let apply = async (e) => {
    e.preventDefault();

    if (customTipAmount > 0) {
      tipPercent = (customTipAmount / amountFiat) * 100;
      showCustomAmount = false;
    }
  };

  let active = (amount) =>
    !customTipAmount && Math.round(tipPercent) === parseInt(amount.slice(0, 2));

  const handleCustomTipAmount = (e) => {
    customTipAmount = e.target.value;
    tipPercent = (customTipAmount / amountFiat) * 100;
    tip = Math.round((amount / 100) * tipPercent);
  };

  let timeout;
  const handleSlide = (e) => {
    customTipAmount = "";
    if (customInput) {
      customInput.value = "";
    }
    tipPercent = e.target.value;
    tip = Math.round((amount / 100) * tipPercent);
  };

  let submitting = $state();
  const handleTipButtonClick = async (v) => {
    submitting = true;
    if (v === "No") {
      tipPercent = 0;
      tip = 0;
    } else {
      tipPercent = parseInt(v.slice(0, 2));
      tip = Math.round((amount / 100) * tipPercent);
    }

    await tick();
    submit.click();
  };

  let submit = $state();

  let { data } = $props();
  let { invoice, id, user } = $state(data);
  let {
    aid,
    amount,
    hash,
    items,
    type,
    received,
    prompt,
    text,
    tip,
    user: { username },
  } = $state(invoice);
  let locale = $derived(loc(user));

  let qr;
  let tipPercent = $state((tip / amount) * 100);

  let fullscreen;

  let currency = user?.currency || invoice.currency;
  let rate = invoice.rate * (data.rate / data.invoiceRate);

  $effect(() => {
    tip = Math.round((amount / 100) * untrack(() => tipPercent));
  });

  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
  let tipAmount = $derived(((tip * rate) / sats).toFixed(2));
  let invoiceAmountFiatFormatted = $derived(f(amountFiat, currency));
</script>

<div class="container px-4 max-w-lg text-center mx-auto">
  <form method="POST" use:enhance class="space-y-5">
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="tip" value={tip} />

    <h1 class="text-4xl font-semibold my-8">{$t("invoice.addTipq")}</h1>
    {#if !showCustomAmount}
      <div class="my-2 text-xl">{Math.round(tipPercent)}%</div>

      <Slider handle={handleSlide} bind:value={tipPercent} />

      <div class="flex mb-8 text-lg">
        <div>
          <span class="mr-1">
            {f(amountFiat, currency, locale)}
            <span class="font-semibold">+{f(tipAmount, currency, locale)}</span>
          </span>
        </div>

        <div class="ml-auto text-lg flex gap-2">
          <div class="flex items-center">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
            ></iconify-icon>
            <div>{s(amount, locale)}</div>
          </div>

          <div class="flex items-center">
            <div class="font-semibold">
              +{s(tip, locale)}
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        {#if tip}
          <button type="button" class="btn" onclick={() => submit.click()}
            >Next</button
          >
          <button type="button" class="btn" onclick={() => (tipPercent = 0)}
            >Reset</button
          >
        {:else}
          {#each tipAmounts as amount, i}
            {#if i === 0}
              <button
                use:focus
                type="button"
                class="btn"
                class:active={active(amount, tipPercent)}
                onclick={() => handleTipButtonClick(amount)}>{amount}</button
              >
            {:else}
              <button
                type="button"
                class="btn"
                class:active={active(amount, tipPercent)}
                onclick={() => handleTipButtonClick(amount)}>{amount}</button
              >
            {/if}
          {/each}
        {/if}
      </div>

      <div class="space-y-2">
        <button
          type="button"
          class="btn"
          onclick={() => (showCustomAmount = true)}
          >{$t("payments.custom")}</button
        >
        <a href={`/invoice/${id}`} class="btn">{$t("payments.cancel")}</a>
      </div>
    {/if}

    <button type="submit" bind:this={submit}></button>
  </form>

  {#if showCustomAmount}
    <form onsubmit={apply} class="space-y-2">
      <input
        bind:this={customInput}
        type="number"
        step="0.01"
        oninput={(e) => handleCustomTipAmount(e)}
        placeholder={$t("payments.amount")}
        use:focus
      />
      <button type="submit" class="btn" disabled={!customTipAmount}
        >Apply</button
      >
    </form>
  {/if}
</div>
