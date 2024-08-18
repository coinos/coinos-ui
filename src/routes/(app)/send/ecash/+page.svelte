<script>
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { rate } from "$lib/store";
  import { fail, s } from "$lib/utils";

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
</script>

<a href="/send">
  <button type="button" class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80">
    <Icon icon="arrow-left" style="w-10" />
  </button>
</a>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">
    {$t("payments.createEcash")}
  </h1>

  <form use:enhance method="POST">
    <Numpad bind:amount bind:fiat {currency} {submit} bind:rate={$rate} />
    <input type="hidden" name="amount" bind:value={amount}/>

    <div class="flex justify-center gap-2">
      <button
        type="button"
        class="hover:opacity-80 bg-black text-white rounded-2xl py-3 px-4 mt-2 border font-bold"
        on:click|preventDefault={setMax}
        on:keydown={setMax}>Max ⚡️{s(balance)}</button
      >

      <button
        use:focus
        bind:this={submit}
        type="submit"
        class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24"
      >
        {$t("payments.next")}
      </button>
    </div>
  </form>
</div>
