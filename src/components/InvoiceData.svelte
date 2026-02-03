<script>
  import Amount from "$comp/Amount.svelte";

  import { btc, copy, f, sat, s, sats, types } from "$lib/utils";
  let {
    showQr,
    link,
    txt,
    invoice,
    amount,
    amountFiat,
    currency,
    locale,
    tip,
    rate,
    t,
  } = $props();

  let loaded = $state(false);
  let { memo } = $derived(invoice);
  let load = () => (loaded = true);
</script>

{#if showQr}
  <div class="max-w-[360px] mx-auto min-h-[360px]">
    <a href={link}>
      <img
        src={`/qr/${encodeURIComponent(invoice.text)}/raw`}
        class="z-10 border-4 border-white opacity-0 transition-opacity duration-300"
        class:opacity-100={loaded}
        onload={load}
        alt={txt}
      />
    </a>
  </div>
{/if}

{#if invoice.type === types.liquid}
  <div class="flex justify-center p-4 shadow items-center gap-2">
    <iconify-icon
      noobserver
      icon="ph:warning-bold"
      width="48"
      class="text-warning"
    ></iconify-icon>
    <div>
      <div class="my-auto text-xl text-center text-secondary">
        {t("payments.onlyLbtc")}
        <span class="text-teal-500 font-bold">L-BTC</span> &mdash;
        {t("payments.dontDeposit")}
      </div>
    </div>
  </div>
{/if}

{#if !showQr || txt?.length <= 120}
  <div
    class="break-all text-center text-secondary text-xl flex gap-1 items-center justify-center"
  >
    {txt}

    <button type="button" onclick={() => copy(txt)} aria-label="Copy invoice">
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
    </button>
  </div>
{/if}

{#each invoice.items as i}
  <div class="grid grid-cols-12 text-xl">
    <div class="col-span-1 my-auto">{i.quantity}</div>
    <div class="mr-auto grow col-span-7 my-auto">
      {i.name}
    </div>
    <div class="col-span-2 font-semibold text-right my-auto">
      {f(i.price * i.quantity, currency)}
    </div>
    <div class="col-span-2 text-secondary text-right text-lg my-auto">
      {sat(btc(i.price * i.quantity, rate))}
    </div>
  </div>
{/each}

{#if amount > 0}
  <Amount {amount} {currency} {rate} {locale} {tip} />
{/if}

{#if memo}
  <div class="text-xl text-center">{memo}</div>
{/if}
