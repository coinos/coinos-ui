<script>
  import { sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { pin } from "$lib/store";

  let { data, form } = $props();

  let { currency, username } = data.user;
  let {
    defaultDescription,
    minWithdrawable,
    maxWithdrawable,
    k1,
    callback,
    rates,
  } = data;
  let rate = $derived(rates[currency]);

  let amount = $state(Math.round(minWithdrawable / 1000)),
    loading = $state();

  let submit = () => (loading = true);
  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
</script>

<div class="container px-4 mt-20 max-w-xl mx-auto">
  <div class="text-center mb-8">
    <div>
      <h1 class="text-3xl md:text-4xl font-semibold mb-2">
        {defaultDescription}
      </h1>
    </div>
  </div>

  {#if form?.error}
    <div class="text-red-600 text-center mb-5">
      {form.error}
    </div>
  {/if}

  {#if minWithdrawable === maxWithdrawable}
    <div class="text-center font-bold text-2xl mb-4">
      <div>
        {f(amountFiat, currency)}
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(amount)}`}</span
        >
      </div>
    </div>
  {:else}
    <Numpad bind:amount {currency} {rate} />
  {/if}

  <form action="?/withdraw" method="POST" use:enhance onsubmit={submit}>
    <input name="amount" value={amount} type="hidden" />
    <input name="username" value={username} type="hidden" />
    <input name="currency" value={currency} type="hidden" />
    <input name="minWithdrawable" value={minWithdrawable} type="hidden" />
    <input name="maxWithdrawable" value={maxWithdrawable} type="hidden" />
    <input name="callback" value={callback} type="hidden" />
    <input name="k1" value={k1} type="hidden" />

    <div class="flex w-full">
      <button type="submit" class="btn">
        {#if loading}
          <Spinner />
        {:else}
          {$t("payments.redeem")}
        {/if}
      </button>
    </div>
  </form>
</div>
