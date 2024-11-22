<script lang="ts">
  import { goto } from "$app/navigation";
  import { fail, post } from "$lib/utils";
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

  const { data, form } = $props();

  let formElement = $state();
  let submitting = $state();
  let submit = async (e) => {
    e.preventDefault();
    submitting = true;

    try {
      let { pid, token } = await post("/ecash/mint", { amount });
      const dec = (token) => getDecodedToken(token).token[0];
      let { proofs } = dec(token);
      let { id, mints, unit = "" } = req;
      let mint = mints[0];
      const paymentPayload: PaymentRequestPayload = {
        id,
        mint,
        unit,
        proofs,
      };

      const paymentPayloadString = JSON.stringify(paymentPayload);
      let event = wrapEvent(
        await getPrivateKey(user),
        { publicKey: recipient.pubkey },
        JSON.stringify(paymentPayload),
      );

      await sign({ event, user });
      await send(event);

      goto(`/sent/${pid}`);
    } catch (e) {
      console.log(e);
      fail(e.message);
    }

    submitting = false;
  };

  let { rates, recipient, req, user } = $derived({ ...data, ...form });
  let { currency } = $derived(user);
  let a = $state();
  let next = $state();
  let toggle = () => (show = !show);
  let amount = $derived(form?.amount || data.req.amount);

  $effect(() => ($rate ||= rates[currency]));
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
