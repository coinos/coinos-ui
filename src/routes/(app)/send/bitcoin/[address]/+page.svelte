<script lang="ts">
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { fiat as fiatStore, rate } from "$lib/store";
  import { loc, fail, focus, s, f, sats } from "$lib/utils";

  let { data } = $props();

  let balance = $derived(data.balance);
  let user = $derived(data.user);
  let { address } = $page.params;
  let currency = $derived(user.currency);
  let username = $derived(user.username);
  let locale = $derived(loc(user));

  let amount = $state(0);
  let a = $state(0);
  let submit: HTMLButtonElement | undefined = $state(),
    fiat = $state();
  $effect(() => void ($rate = data.rate));
  $effect(() => void (amount = a));

  let setMax = async (e) => {
    e.preventDefault();
    fiat = false;
    amount = balance;
    await tick();
    submit?.click();
  };
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  <div class="text-xl text-secondary break-all">{address}</div>

  <Numpad bind:amount={a} bind:fiat {currency} {submit} bind:rate={$rate} {locale} />

  <div class="flex justify-center gap-2">
    <button type="button" class="btn !w-auto grow" onclick={setMax} onkeydown={setMax}>
      {#if $fiatStore}
        Max {f((balance * ($rate as number)) / sats, currency, locale)}
      {:else}
        Max ⚡️{s(balance)}
      {/if}
    </button>

    <form action={`/send/bitcoin/${address}/${amount}`} class="contents">
      <button use:focus bind:this={submit} type="submit" class="btn !w-auto grow btn-accent">
        {$t("payments.next")}
      </button>
    </form>
  </div>
</div>
