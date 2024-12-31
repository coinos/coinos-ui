<script>
  import { tick } from "svelte";
  import handler from "$lib/handler";
  import { sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { fiat, pin } from "$lib/store";

  let { data, form } = $props();

  let { currency, username } = data.user;
  let {
    defaultDescription,
    minWithdrawable,
    maxWithdrawable,
    k1,
    callback,
    rate,
  } = data;

  let amount = $state(Math.round(minWithdrawable / 1000));
  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));

  let submit = $state();
  let submitting = $state();
  let toggle = () => (submitting = !submitting);

  let setMax = async (e) => {
    e.preventDefault();
    $fiat = false;
    await tick();
    amount = Math.floor(maxWithdrawable / 1000);
  };
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

  <form
    use:enhance={handler(toggle)}
    action="?/withdraw"
    method="POST"
    onsubmit={submit}
    class="space-y-5"
  >
    <input name="amount" value={amount} type="hidden" />
    <input name="username" value={username} type="hidden" />
    <input name="currency" value={currency} type="hidden" />
    <input name="minWithdrawable" value={minWithdrawable} type="hidden" />
    <input name="maxWithdrawable" value={maxWithdrawable} type="hidden" />
    <input name="callback" value={callback} type="hidden" />
    <input name="k1" value={k1} type="hidden" />

    <div class="flex gap-2">
      {#if maxWithdrawable > minWithdrawable}
        <button
          type="button"
          class="btn !w-auto grow"
          onclick={setMax}
          disabled={submitting}
          onkeydown={setMax}
          >Max ⚡️{s(Math.floor(maxWithdrawable / 1000))}</button
        >
      {/if}

      <button
        use:focus
        bind:this={submit}
        type="submit"
        class="btn btn-accent !w-auto grow"
      >
        {#if submitting}
          <Spinner />
        {:else}
          <div class="my-auto">{$t("payments.next")}</div>
        {/if}
      </button>
    </div>
  </form>
</div>
