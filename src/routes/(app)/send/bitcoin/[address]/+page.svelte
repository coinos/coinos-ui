<script>
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { rate } from "$lib/store";
  import { fail, s } from "$lib/utils";

  export let data;

  let { balance, rates, user } = data;
  let { address } = $page.params;
  let { currency, username } = user;

  let amount = 0;
  let submit, fiat;

  $: update(data);
  let update = () => ($rate = data.rates[currency]);

  let setMax = () => {
    fiat = false;
    amount = balance;
  };
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  <div class="text-xl text-secondary break-all">{address}</div>

  <Numpad bind:amount bind:fiat {currency} {submit} bind:rate={$rate} />

  <div class="flex justify-center gap-2">
    <button
      type="button"
      class="btn !w-auto grow"
      on:click|preventDefault={setMax}
      on:keydown={setMax}>Max ⚡️{s(balance)}</button
    >

    <form action={`/send/bitcoin/${address}/${amount}`} class="contents">
      <button use:focus bind:this={submit} type="submit" class="btn !w-auto grow btn-accent">
        {$t("payments.next")}
      </button>
    </form>
  </div>
</div>
