<script>
  import { enhance, applyAction } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { rate } from "$lib/store";
  import { fail, s } from "$lib/utils";
  import handler from "$lib/handler";

  let { data } = $props();

  let { user } = $derived(data);
  let { balance, currency, username } = $derived(user);

  let amount = $state(0);
  let submit = $state(),
    fiat = $state();

  let setMax = (e) => {
    e.preventDefault();
    fiat = false;
    amount = balance;
  };

  let submitting = $state();
  let toggle = () => (submitting = !submitting);
  $effect(() => ({ rate: $rate } = data));
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <form use:enhance={handler(toggle)} method="POST" class="space-y-5">
    <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
      {$t("payments.fundingAmount")}
    </h1>
    <Numpad bind:amount bind:fiat {currency} {submit} bind:rate={$rate} />
    <input type="hidden" name="amount" bind:value={amount} />

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
