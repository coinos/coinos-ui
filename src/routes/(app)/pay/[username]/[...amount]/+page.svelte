<script>
  import { run } from "svelte/legacy";

  import { t } from "$lib/translations";
  import { goto } from "$app/navigation";
  import { pin } from "$lib/store";
  import { enhance } from "$app/forms";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { f, fail, post, s, sat, sats } from "$lib/utils";

  let { data, form } = $props();

  let { subject, rate, rates, user } = $state(data);
  let currency = subject?.currency || "USD";
  let next = $state();

  let amount = $state(form?.amount || data.amount);
  let a = $state(),
    af = $state(0),
    fiat = $state(!amount),
    hash = $state(),
    amountFiat = 0;

  let setAmount = async () => {
    amount = a;
    amountFiat = parseFloat(af).toFixed(2);
    rate = fiat ? (sats * amountFiat) / amount : r;

    let id;
    try {
      ({ id, hash } = await post(`/invoice`, {
        invoice: {
          amount,
          rate: rates[subject.currency],
          prompt: subject.prompt,
          type: "lightning",
        },
        user: subject,
      }));
    } catch (e) {
      fail(e.message);
    }

    goto(`/send/invoice/${id}`);
  };

  let loading = $state();
  let submit = () => (loading = true);

  let update = () => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  };
  let r;
  run(() => {
    r = rate || rates[subject?.currency];
  });
  run(() => {
    update(form);
  });
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-2">
  <Numpad
    bind:amount={a}
    bind:amountFiat={af}
    {currency}
    bind:fiat
    bind:rate={r}
    submit={next}
  />

  <form method="POST" use:enhance onsubmit={submit}>
    <input name="amount" value={amount} type="hidden" />
    <input name="username" value={subject.username} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />
    <input name="hash" value={hash} type="hidden" />

    <div class="flex w-full text-xl">
      {#if amount}
        <button
          type="submit"
          class="opacity-100 hover:opacity-80'} rounded-2xl border py-5 font-bold mx-auto mt-2 bg-black text-white px-6 w-40"
        >
          {#if loading}
            <Spinner />
          {:else}
            {$t("payments.send")}
          {/if}
        </button>
      {:else}
        <button
          type="button"
          bind:this={next}
          class="btn btn-accent"
          onclick={setAmount}
          onkeydown={setAmount}
        >
          {$t("payments.next")}</button
        >
      {/if}
    </div>
  </form>
</div>
