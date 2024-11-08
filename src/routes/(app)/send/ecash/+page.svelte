<script>
  import { run, preventDefault } from 'svelte/legacy';

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

  let { rates, user } = data;
  let { balance, currency, username } = user;

  let amount = $state(0);
  let submit = $state(), fiat = $state();

  let update = () => ($rate = data.rates[currency]);

  let setMax = () => {
    fiat = false;
    amount = balance;
  };

  let submitting = $state();
  let toggle = () => (submitting = !submitting);
  run(() => {
    update(data);
  });
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <div class="card text-left rounded-2xl shadow shadow-primary p-4 bg-base-200">
    <div class="text-secondary">
      {$t("payments.ecashDesc")}
      <a href="https://cashu.space/" class="font-bold">cashu.space</a>
    </div>
  </div>
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
        onclick={preventDefault(setMax)}
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
