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

  let { alias, memo, payreq, ourfee, fee, quoteError, balance, user } =
    $derived({ ...data, ...form });
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

  // The max routing fee we hand the server. When the route was quoted this is
  // the exact fee askrene found, so the debit matches what's shown; without a
  // quote fall back to the old 2% reserve (any unused part is credited back).
  let quoted = $derived(typeof fee === "number");
  let fallback = $derived(Math.max(5, Math.round(amount * 0.02) || 0));
  let maxfee = $state(
    untrack(() => (typeof fee === "number" ? fee : Math.max(5, Math.round(amount * 0.02) || 0))),
  );
  $effect(() => (maxfee = quoted ? fee : fallback));

  let total = $derived((amount || 0) + (maxfee || 0) + (ourfee || 0));

  // Server-side messages worth showing verbatim: a balance shortfall, or the
  // pre-flight check that the max fee is below what routing now costs.
  let verbatim = $derived(
    form?.message &&
      (form.message.includes($t("payments.insufficientFunds")) ||
        form.message.includes("Routing fee")),
  );
</script>

<div class="container px-4 max-w-xl mx-auto text-center space-y-2">
  {#if form?.message}
    <div class="text-red-600 text-center">
      {#if verbatim}
        <div>{form.message}</div>
        {#if form.message.includes($t("payments.insufficientFunds"))}
          <div>{$t("payments.lockedBalance")}: {locked}</div>
        {/if}
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

    {#if quoted}
      <div class="text-center">
        <h2 class="text-secondary text-lg">{$t("payments.routingFee")}</h2>

        <div class="flex flex-wrap gap-4 justify-center">
          <div class="my-auto">
            <h2 class="text-xl">
              {f(toFiat(fee, $rate), currency)}
            </h2>
            <h3 class="text-secondary">⚡️{s(fee)}</h3>
          </div>
        </div>
      </div>
    {:else if quoteError}
      <div class="text-secondary">{$t("payments.noQuote")}</div>
    {/if}

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

    {#if quoted && (fee || ourfee)}
      <div class="text-center">
        <h2 class="text-secondary text-lg">{$t("payments.total")}</h2>
        <h2 class="text-xl">{f(toFiat(total, $rate), currency)}</h2>
        <h3 class="text-secondary">⚡️{s(total)}</h3>
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
        <input name="fee" type="hidden" bind:value={maxfee} />
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

      <div class="flex justify-center gap-2">
        <button
          type="submit"
          class="btn !w-auto grow"
          formaction="?/max"
          disabled={loading}
          onclick={submit}
        >
          {#if loading}
            <Spinner />
          {:else}
            Max ⚡️{s(balance)}
          {/if}
        </button>
        <button type="submit" class="btn btn-accent !w-auto grow" bind:this={next}
          >{$t("payments.next")}</button
        >
      </div>
    </form>
  {/if}
</div>
