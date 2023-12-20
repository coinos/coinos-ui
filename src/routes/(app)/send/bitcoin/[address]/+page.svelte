<script>
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { rate } from "$lib/store";
  import { back, s } from "$lib/utils";

  export let data;

  let { rates } = data;
  let { address } = $page.params;
  let { balance, currency } = data.user;

  let amount = 0;
  let submit, fiat;

  $: update(data);
  let update = () => ($rate = data.rates[currency]);

  let setMax = () => {
    fiat = false;
    amount = balance;
  };
</script>

<button
  type="button"
  class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80"
  on:click={back}
>
  <Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  <div class="text-xl text-secondary break-all">{address}</div>

  <Numpad bind:amount bind:fiat {currency} {submit} bind:rate={$rate} />

  <div class="flex justify-center gap-2">
    <button
      type="button"
      class="hover:opacity-80 bg-black text-white rounded-2xl py-3 px-4 mt-2 border font-bold"
      on:click|preventDefault={setMax}
      on:keydown={setMax}>Max ⚡️{s(balance)}</button
    >

    <form action={`/send/bitcoin/${address}/${amount}`}>
      <button
        bind:this={submit}
        type="submit"
        class="opacity-100 hover:opacity-80 rounded-2xl border py-3 font-bold mt-2 bg-black text-white px-4 w-24"
      >
        {$t("payments.next")}
      </button>
    </form>
  </div>
</div>
