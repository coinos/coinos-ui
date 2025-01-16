<script>
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Amount from "$comp/Amount.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { loc, back, post, toFiat, f, s, focus } from "$lib/utils";
  import { sign, send } from "$lib/nostr";
  import { rate, pin } from "$lib/store";

  let { data, form } = $props();

  let { id, request, user } = $derived({ ...data, ...form });
  let a = $state();
  let { currency } = $derived(user);
  let locale = loc(user);
  let event = $state();

  $effect(() => ($rate ||= data.rate));
  $effect(async () => {
    if (form) {
      loading = false;
      event = await sign(request);
      let { pr } = await post("/post/zap", { event });
      goto(`/send/lightning/${pr}`);
    }
  });

  let showMax = $state();

  let loading = $state();
  let submit = () => (loading = true);

  let next = $state();
  let toggle = () => (show = !show);
  let amount = $derived(form?.amount || data.amount);
  let maxfee = $state(Math.max(5, Math.round(untrack(() => amount) * 0.005)));
</script>

<div class="container px-4 max-w-xl mx-auto text-center space-y-2">
  {#if form?.message}
    <div class="text-red-600 text-center">
      {$t(form.message)}
    </div>
  {/if}
  {#if amount}
    <div>
      <h1 class="text-lg text-secondary">
        {$t("payments.send")}
      </h1>

      <Amount {amount} rate={$rate} {currency} {locale} />
    </div>

    <form
      method="POST"
      use:enhance
      onsubmit={submit}
      action="?/send"
      class="space-y-2"
    >
      <input name="event" value={event} type="hidden" />
      <input name="amount" value={amount} type="hidden" />
      <input name="pin" value={$pin} type="hidden" />

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
