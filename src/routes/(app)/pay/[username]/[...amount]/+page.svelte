<script>
  import { t } from "$lib/translations";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { f, loc, fail, post, s, sat, sats } from "$lib/utils";

  let { data, form } = $props();

  let { subject, rate, user } = $state(data);
  let currency = subject?.currency || "USD";
  let locale = $derived(loc(subject));
  let next = $state();

  let initialAmount = form?.amount || data.amount;
  let amount = $state(initialAmount);
  let fiat = $state(!initialAmount);
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-2">
  <Numpad bind:amount bind:fiat {currency} {locale} {rate} submit={next} />

  <form method="POST" use:enhance>
    <input name="amount" value={amount} type="hidden" />
    <input name="rate" value={rate} type="hidden" />
    <input name="username" value={subject.username} type="hidden" />
    <input name="prompt" value={subject.prompt} type="hidden" />

    <button type="submit" bind:this={next} class="btn btn-accent">
      {$t("payments.next")}</button
    >
  </form>
</div>
