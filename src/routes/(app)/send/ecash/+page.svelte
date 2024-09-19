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

  export let data;

  let { rates, user } = data;
  let { balance, currency, username } = user;

  let amount = 0;
  let submit, fiat;

  $: update(data);
  let update = () => ($rate = data.rates[currency]);

  let setMax = () => {
    fiat = false;
    amount = balance;
  };

  let submitting;
  let toggle = () => (submitting = !submitting);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <form use:enhance={handler(toggle)} method="POST">
    <Numpad bind:amount bind:fiat {currency} {submit} bind:rate={$rate} />
    <input type="hidden" name="amount" bind:value={amount} />

    <div>
      <button
        type="button"
        class="hover:opacity-80 rounded-2xl py-3 px-4 mt-2 border font-bold w-full max-w-[340px] mx-auto"
        on:click|preventDefault={setMax}
        disabled={submitting}
        on:keydown={setMax}>Max ⚡️{s(balance)}</button
      >

      <button
        use:focus
        bind:this={submit}
        type="submit"
        class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-full flex justify-center gap-2 max-w-[340px] mx-auto"
      >
        {#if submitting}
          <Spinner />
        {:else}
          <img src="/images/cash.png" class="w-8" />
          <div class="my-auto">{$t("payments.mint")}</div>
        {/if}
      </button>
    </div>
  </form>
</div>
