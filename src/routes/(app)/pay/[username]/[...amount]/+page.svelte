<script>
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { goto, invalidateAll } from "$app/navigation";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { f, loc, fail, post, s, sat, sats } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";

  let { data, form } = $props();

  let { subject, rate, user } = $state(data);
  let currency = subject?.currency || "USD";
  let locale = $derived(loc(subject));
  let next = $state();

  let initialAmount = $derived(form?.amount || data.amount);
  let amount = $state(initialAmount);
  let fiat = $state(!initialAmount);
  let formElement = $state();

  let setMax = (e) => {
    e.preventDefault();
    fiat = false;
    const bal = user.balance;
    const maxfee = Math.max(5, Math.round(bal * 0.02));
    const platformFee = Math.round(bal * 0.001);
    amount = Math.max(0, bal - maxfee - platformFee);
  };
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-2">
  <Numpad bind:amount bind:fiat {currency} {locale} {rate} submit={next} />

  <form
    method="POST"
    use:enhance
    class="flex gap-2 justify-center"
    bind:this={formElement}
  >
    <input name="amount" bind:value={amount} type="hidden" />
    <input name="rate" value={rate} type="hidden" />
    <input name="username" value={subject.username} type="hidden" />
    <input name="prompt" value={subject.prompt} type="hidden" />

    {#if user?.balance}
      <button
        type="button"
        class="btn !w-auto grow"
        onclick={setMax}
        onkeydown={setMax}>Max</button
      >
    {/if}

    <button type="submit" bind:this={next} class="btn btn-accent !w-auto grow">
      {$t("payments.next")}</button
    >
  </form>
</div>
