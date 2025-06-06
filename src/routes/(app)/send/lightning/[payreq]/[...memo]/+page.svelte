<script>
  import { untrack } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Amount from "$comp/Amount.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { loc, back, toFiat, f, s, focus } from "$lib/utils";
  import { rate, pin } from "$lib/store";

  let { data, form } = $props();

  let { alias, memo, payreq, ourfee, user } = $derived({ ...data, ...form });
  let a = $state();
  let { currency, locked } = $derived(user);
  let locale = loc(user);

  $effect(() => ($rate ||= data.rate));
  $effect(() => form && (loading = false));

  let showMax = $state();

  let loading = $state();
  let submit = () => (loading = true);

  let next = $state();
  let toggle = () => (show = !show);
  let amount = $derived(form?.amount || data.amount);
  let maxfee = $state(
    Math.max(5, Math.round(untrack(() => amount) * 0.005 || 0)),
  );
  $effect(() => (maxfee = Math.max(5, Math.round(amount * 0.005) || 0)));
</script>

<div class="container px-4 max-w-xl mx-auto text-center space-y-2">
  {#if form?.message}
    <div class="text-red-600 text-center">
      {#if form.message.includes($t("payments.insufficientFunds"))}
        <div>{form.message}</div>
        <div>{$t("payments.lockedBalance")}: {locked}</div>        
      {:else}
        {$t("payments.failedToRoute")}
      {/if}
    </div>
  {/if}
  {#if amount}
    <div>
      <h1 class="text-lg text-secondary">
        {$t("payments.send")}
      </h1>

      <Amount {amount} rate={$rate} {currency} {locale} />
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
              {f(toFiat(ourfee, $rate), currency)}
            </h2>
            <h3 class="text-secondary">⚡️{s(ourfee)}</h3>
          </div>
        </div>
      </div>
    {/if}

    <form
      method="POST"
      use:enhance
      onsubmit={submit}
      action="?/send"
      class="space-y-2"
    >
      <input name="payreq" value={payreq} type="hidden" />
      <input name="amount" value={amount} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />
      <input name="memo" type="hidden" value={memo} />

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
              name="fee"
              bind:value={maxfee}
              class="clean !grow"
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
        <button type="button" class="btn" onclick={() => (showMax = !showMax)}
          >{$t("payments.advancedSettings")}</button
        >
        <input name="maxfee" type="hidden" bind:value={maxfee} />
      {/if}
    </form>
  {:else}
    <form method="POST" action="?/setAmount" class="space-y-2" use:enhance>
      <input type="hidden" value={a} name="amount" />
      <input name="rate" value={$rate} type="hidden" />

      <Numpad
        bind:amount={a}
        {currency}
        {locale}
        bind:rate={$rate}
        submit={next}
      />
      <button type="submit" class="btn" bind:this={next}
        >{$t("payments.next")}</button
      >
    </form>
  {/if}
</div>
