<script lang="ts">
  import PhWarningBold from "virtual:icons/ph/warning-bold";
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import Amount from "$comp/Amount.svelte";

  import { btc, copy, f, sat, sats, types } from "$lib/utils";
  import { fiat } from "$lib/store";
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
    align = "",
    t,
  }: any = $props();

  let loaded = $state(false);
  let expanded = $state(false);
  let { memo } = $derived(invoice);
  let load = () => (loaded = true);
</script>

{#if showQr}
  <div class="max-w-[280px] mx-auto min-h-[280px]">
    <a href={link}>
      <img
        src={`/qr/${encodeURIComponent(invoice.text)}/raw`}
        class="z-10 border-4 border-white"
        alt={txt}
      />
    </a>
  </div>
{/if}

{#if invoice.type === types.liquid}
  <div class="flex justify-center p-4 shadow items-center gap-2">
    <PhWarningBold width="48" class="text-warning" />
    <div>
      <div class="my-auto text-xl text-center text-secondary">
        {t("payments.onlyLbtc")}
        <span class="text-teal-500 font-bold">L-BTC</span>
        &mdash; {t("payments.dontDeposit")}
      </div>
    </div>
  </div>
{/if}

  <button
    data-testid="invoice-text"
    onclick={() => { copy(txt); expanded = !expanded; }}
    aria-label="Copy invoice"
    class="w-full text-center text-secondary text-xl flex gap-1 items-center justify-center cursor-pointer hover:opacity-70"
  >
    <span class:truncate={!expanded} class="break-all">{txt}</span>
    <PhCopyBold width="32" class="shrink-0" />
  </button>

{#each invoice.items as i}
  {@const itemTotal = i.price * i.quantity}
  <div class="grid grid-cols-12 text-xl">
    <div class="col-span-1 my-auto">{i.quantity}</div>
    <div class="mr-auto grow col-span-7 my-auto">{i.name}</div>
    <div class="col-span-4 font-semibold text-right my-auto" class:hidden={!$fiat}>{f(itemTotal, currency)}</div>
    <div class="col-span-4 font-semibold text-right my-auto" class:hidden={$fiat}>{sat(btc(itemTotal, rate))}</div>
  </div>
{/each}

{#if amount > 0}
  <Amount {amount} {currency} {rate} {locale} {tip} />
{/if}

{#if memo}
  <div class="text-xl text-center">{memo}</div>
{/if}
