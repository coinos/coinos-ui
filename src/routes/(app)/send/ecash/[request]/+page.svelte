<script lang="ts">
  import { goto } from "$app/navigation";
  import { focus, fail, post } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Amount from "$comp/Amount.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { rate, pin } from "$lib/store";
  import { wrapEvent } from "nostr-tools/nip17";
  import { getPrivateKey, sign, send } from "$lib/nostr";
  import { getDecodedToken } from "@cashu/cashu-ts";
  import type { PaymentRequestPayload } from "@cashu/cashu-ts";
  import { AbstractSimplePool } from "nostr-tools/abstract-pool";

  const alwaysTrue: any = (t: Event) => {
    t[Symbol("verified")] = true;
    return true;
  };

  export const pool = new AbstractSimplePool({ verifyEvent: alwaysTrue });

  const { data, form } = $props();

  let formElement = $state();
  let submitting = $state();
  let submit = async (e) => {
    e.preventDefault();
    submitting = true;

    try {
      let { pid, token } = await post("/ecash/mint", { amount });
      let { proofs } = getDecodedToken(token);
      let { id, mints, unit = "" } = req;
      let mint = mints[0];

      const payload = {
        id,
        mint,
        unit,
        proofs,
      };

      if (type === "nostr") {
        let event = wrapEvent(
          await getPrivateKey(user),
          { publicKey: recipient.pubkey },
          JSON.stringify(payload),
        );

        await Promise.any(pool.publish(recipient.relays, event));
      } else if (type === "post") {
        await post("/ecash/post", { target, payload });
      }

      goto(`/sent/${pid}`);
    } catch (e) {
      console.log(e);
      fail(e.message);
    }

    submitting = false;
  };

  let { recipient, req, user, type, target } = $derived({
    ...data,
    ...form,
  });
  let { currency } = $derived(user);
  let a = $state();
  let next = $state();
  let toggle = () => (show = !show);
  let amount = $derived(form?.amount || data.req.amount);

  $effect(() => ($rate ||= data.rate);
  $effect(() => form && (submitting = false));
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

      <Amount {amount} rate={$rate} {currency} />
    </div>

    <div class="text-xl">
      <span class="text-secondary">{$t("payments.to")}</span>
      <span class="break-words font-semibold">{recipient.name}</span>
    </div>

    <form onsubmit={submit} class="space-y-2" bind:this={formElement}>
      <input name="amount" value={amount} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />

      <button
        type="submit"
        class="btn btn-primary"
        disabled={submitting}
        use:focus
      >
        {#if submitting}
          <Spinner />
        {:else}
          {$t("payments.send")}
        {/if}
      </button>
    </form>
  {:else}
    <form method="POST" action="?/setAmount" class="space-y-2" use:enhance>
      <input type="hidden" value={a} name="amount" />
      <input name="rate" value={$rate} type="hidden" />

      <Numpad bind:amount={a} {currency} bind:rate={$rate} submit={next} />
      <button type="submit" class="btn" bind:this={next}
        >{$t("payments.next")}</button
      >
    </form>
  {/if}
</div>
