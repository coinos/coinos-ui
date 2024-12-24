<script>
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { pin } from "$lib/store";
  import handler from "$lib/handler";
  import { s } from "$lib/utils";

  let { data, form } = $props();
  let { amount } = $state(data);
  let { balance, currency } = data.user;
  let { name, rate } = $derived(data);
  let loading = $state();
  let fiat = $state();

  let submit = $state();
  let submitting = $state();
  let toggle = () => (submitting = !submitting);
  $effect(() => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  });

  let setMax = (e) => {
    e.preventDefault();
    fiat = false;
    amount = balance;
  };
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
  <Numpad bind:amount {currency} {rate} {fiat} {submit} />

  <form use:enhance={handler(toggle)} method="POST" class="space-y-5">
    <input name="fund" value={name} type="hidden" />
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
