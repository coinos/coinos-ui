<script>
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Amount from "$comp/Amount.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { loc, back, fail, post, toFiat, f, s, focus } from "$lib/utils";
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
      try {
        loading = false;
        event = await sign(request);
        let { pr: payreq } = await post("/post/zap", { event });
        await post("/post/payments", { amount, payreq, pin: $pin });
        goto(`/e/${id}`);
      } catch (e) {
        fail(e.message);
      }
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
</div>
