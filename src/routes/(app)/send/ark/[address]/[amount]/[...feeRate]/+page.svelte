<script lang="ts">
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Spinner from "$comp/Spinner.svelte";
  import { focus, s, post } from "$lib/utils";
  import { pin } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { rate } from "$lib/store";
  import { applyAction } from "$app/forms";
  import { sendArk } from "$lib/ark";

  import Amount from "$comp/Amount.svelte";

  let { data, form } = $props();

  let error = $state("");

  let handler = ({ cancel }) => {
    if (account.type === "ark") {
      cancel();

      (async () => {
        submitting = true;
        error = "";
        try {
          const txid = await sendArk(address, parseInt(amount));

          const p = await post("/post/ark/vault-send", {
            hash: txid,
            amount: parseInt(amount),
            aid: account.id,
          });

          goto(`/sent/${p.id}`, { invalidateAll: true });
        } catch (e) {
          submitting = false;
          error = e.message || "Failed to send";
        }
      })();

      return;
    }

    submitting = true;
    error = "";

    return async ({ result }) => {
      submitting = false;
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
        invalidate("app:payments");
      }
    };
  };

  let { account, amount, address, message } = $derived(data);

  let { feeRate } = $state(data);

  $effect(() => {
    if (!$rate) $rate = data.rate;
  });

  let { balance, currency } = data.user;
  let submitting = $state(false),
    submit = $state();
</script>

<div
  class="container px-4 max-w-xl mx-auto space-y-5 text-center no-transition"
>
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  {#if form?.message || message || error}
    <div class="mb-5">
      <div class="text-red-600">{form?.message || message || error}</div>
    </div>
  {/if}

  {#if !error}
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

<style>
  .no-transition {
    view-transition-name: fee;
  }
</style>
