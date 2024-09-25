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
        class="hover:opacity-80 rounded-2xl py-5 px-6 mt-2 font-bold w-full mx-auto bg-primary"
        on:click|preventDefault={setMax}
        disabled={submitting}
        on:keydown={setMax}>Max ⚡️{s(balance)}</button
      >

      <button
        use:focus
        bind:this={submit}
        type="submit"
        class="opacity-100 hover:opacity-80 rounded-2xl border py-5 font-bold mt-2 bg-black text-white px-6 w-full flex justify-center gap-2 mx-auto"
      >
        {#if submitting}
          <Spinner />
        {:else}
          <div class="my-auto">{$t("payments.mint")}</div>
        {/if}
      </button>
    </div>
  </form>
</div>
