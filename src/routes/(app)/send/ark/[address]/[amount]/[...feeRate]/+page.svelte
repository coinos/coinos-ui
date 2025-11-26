<script>
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Toggle from "$comp/Toggle.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { toFiat, f, focus, s, sat, closest, network } from "$lib/utils";
  import { pin } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { rate } from "$lib/store";
  import { applyAction } from "$app/forms";
  import { getWallet } from "$lib/ark";

  import Amount from "$comp/Amount.svelte";

  let { data, form } = $props();

  let passwordPrompt = $state();
  let password = $state();
  let cancel = $state(() => (passwordPrompt = false));

  let togglePassword = () => (passwordPrompt = !passwordPrompt);
  let handler = async ({ cancel }) => {
    let wallet = await getWallet();
    const txid = await wallet.sendBitcoin({
      address,
      amount,
    });

    console.log(txid);

    return async ({ result }) => {
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
        invalidate("app:payments");
      }
    };
  };

  let toggle = () => (submitting = !submitting);

  let { account, amount, address, message } = $derived(data);

  let { feeRate } = $state(data);

  $effect(() => {
    if (!$rate) $rate = data.rate;
  });

  let { balance, currency } = data.user;
  let submitting = $state(),
    submit = $state(),
    showSettings;

  let toggleSettings = () => (showSettings = !showSettings);
</script>

<div
  class="container px-4 max-w-xl mx-auto space-y-5 text-center no-transition"
>
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  {#if form?.message || message}
    <div class="mb-5">
      <div class="text-red-600">{form?.message || message}</div>
    </div>
  {:else}
    <div class="text-xl text-secondary break-all">{address}</div>

    <Amount {amount} rate={$rate} {currency} />

    <form method="POST" use:enhance={handler}>
      <input name="pin" value={$pin} type="hidden" />
      <input name="rate" value={$rate} type="hidden" />
      <input name="aid" value={account.id} type="hidden" />

      <div class="flex justify-center gap-2">
        <button
          use:focus
          bind:this={submit}
          type="submit"
          class="btn btn-accent"
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
  {/if}
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel submit={signTx} />
{/if}

<style>
  .no-transition {
    view-transition-name: fee;
  }
</style>
