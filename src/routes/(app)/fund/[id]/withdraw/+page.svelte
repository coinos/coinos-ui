<script>
  import { tick } from "svelte";
  import handler from "$lib/handler";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { loc, s } from "$lib/utils";
  import { fiat, pin } from "$lib/store";

  let { data, form } = $props();

  let { user } = $derived(data);
  let { currency } = $derived(user);
  let loading = $state();
  let { id, balance, rate } = $derived(data);
  let { amount } = $state(data);
  let locale = loc(user);

  let submit = $state();
  let submitting = $state();
  let toggle = () => (submitting = !submitting);
  $effect(() => {
    if (form?.message.includes("pin")) $pin = undefined;
    loading = false;
  });

  let setMax = async (e) => {
    e.preventDefault();
    $fiat = false;
    await tick();
    amount = balance;
  };
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
  <Numpad bind:amount {currency} {fiat} {rate} {submit} {locale} />

  <form use:enhance={handler(toggle)} method="POST" class="space-y-5">
    <input name="id" value={id} type="hidden" />
    <input name="amount" value={amount} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />

    <div class="flex gap-2">
      <button
        type="button"
        class="btn !w-auto grow"
        onclick={setMax}
        disabled={submitting}
        onkeydown={setMax}>Max ⚡️{s(balance)}</button
      >

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
