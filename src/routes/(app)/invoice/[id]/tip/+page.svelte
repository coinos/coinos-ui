<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { invoice as inv, request } from "$lib/store";
  import { copy, focus, f, sat, get, reverseFormat, s, sats } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import Slider from "$comp/Slider.svelte";
  import { goto } from "$app/navigation";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";

  const tipAmounts = ["No", "10%", "15%", "20%"];
  let showCustomAmount;

  let customInput;
  let customTipAmount;

  let apply = async () => {
    if (customTipAmount > 0) {
      tipPercent = (customTipAmount / amountFiat) * 100;
      showCustomAmount = false;
    }
  };

  let active = (amount) =>
    !customTipAmount && Math.round(tipPercent) === parseInt(amount.slice(0, 2));

  const handleCustomTipAmount = (e) => {
    tipPercent = 0;
    customTipAmount = e.target.value;
  };

  let timeout;
  const handleSlide = (e) => {
    customTipAmount = "";
    if (customInput) {
      customInput.value = "";
    }
    tipPercent = e.target.value;
  };

  let submitting;
  const handleTipButtonClick = async (amount) => {
    submitting = true;
    if (amount === "No") {
      tipPercent = 0;
    } else {
      tipPercent = parseInt(amount.slice(0, 2));
    }

    await tick();
    submit.click();
  };

  let submit;

  export let data;
  $: refresh(data);
  let { invoice, id, user, rates } = data;
  let {
    aid,
    amount,
    hash,
    items,
    type,
    rate,
    received,
    prompt,
    text,
    tip,
    user: { username, currency },
  } = invoice;

  let qr;
  let tipPercent = 0;

  let fullscreen;

  let refresh = (data) => {
    $inv = null;

    ({ invoice, id } = data);
    ({
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
    } = invoice);

    tipPercent = (tip / amount) * 100;
  };

  $: currency = user?.currency || invoice.currency;
  $: rate = invoice.rate * (rates[currency] / rates[invoice.currency]);

  $: tip = Math.round((amount / 100) * tipPercent);

  $: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));

  $: tipAmount = ((tip * rate) / sats).toFixed(2);

  $: invoiceAmountFiatFormatted = f(amountFiat, currency);

  onMount(() => ($request = undefined));
</script>

<div class="container px-4 max-w-lg text-center mx-auto">
  <form
    method="POST"
    use:enhance
    class:invisible={submitting}
    class="space-y-5"
  >
    <input type="hidden" name="aid" value={aid} />
    <input type="hidden" name="amount" value={amount} />
    <input type="hidden" name="tip" value={tip} />
    <input type="hidden" name="username" value={username} />
    <input type="hidden" name="rate" value={invoice.rate} />
    <input type="hidden" name="prompt" value="false" />
    <input type="hidden" name="type" value={type} />
    <input type="hidden" name="hash" value={hash} />
    <input type="hidden" name="items" value={JSON.stringify(items)} />

    {#if invoice.memoPrompt}
      <input type="hidden" name="memoPrompt" value={invoice.memoPrompt} />
    {/if}

    <h1 class="text-4xl font-semibold my-8">{$t("invoice.addTipq")}</h1>
    {#if !showCustomAmount}
      <div class="my-2 text-xl">{Math.round(tipPercent)}%</div>

      <Slider handle={handleSlide} bind:value={tipPercent} />

      <div class="flex mb-8 text-lg">
        <div>
          <span class="mr-1">
            {f(amountFiat, currency)}
            <span class="font-semibold">+{f(tipAmount, currency)}</span>
          </span>
        </div>

        <div class="ml-auto text-lg">
          {sat(amount)}
          <span class="font-semibold">+{sat(tip)}</span>
        </div>
      </div>

      <div class="space-y-2">
        {#if tip}
          <button type="button" class="btn" on:click={() => submit.click()}
            >Next</button
          >
          <button type="button" class="btn" on:click={() => (tipPercent = 0)}
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
                on:click={() => handleTipButtonClick(amount)}>{amount}</button
              >
            {:else}
              <button
                type="button"
                class="btn"
                class:active={active(amount, tipPercent)}
                on:click={() => handleTipButtonClick(amount)}>{amount}</button
              >
            {/if}
          {/each}
        {/if}
      </div>

      <div>
        <button
          type="button"
          class="btn"
          on:click={() => (showCustomAmount = true)}>Custom</button
        >
      </div>
    {/if}

    <button type="submit" bind:this={submit} />
  </form>

  {#if showCustomAmount}
    <form on:submit|preventDefault={apply} class="space-y-2">
      <input
        bind:this={customInput}
        type="number"
        step="0.01"
        on:input={(e) => handleCustomTipAmount(e)}
        placeholder={$t("payments.amount")}
        use:focus
      />
      <button type="submit" class="btn" disabled={!customTipAmount}
        >Apply</button
      >
    </form>
  {/if}
</div>
