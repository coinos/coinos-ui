<script>
  import Amount from "$comp/Amount.svelte";

  import { btc, f, sat, s, sats } from "$lib/utils";
  let {
    showQr,
    src,
    link,
    txt,
    invoice,
    amount,
    amountFiat,
    currency,
    locale,
    tip,
    rate,
  } = $props();
</script>

{#if showQr}
  <div>
    <a href={link}>
      <img
        src={`/qr/${encodeURIComponent(invoice.text)}/raw`}
        class="mx-auto z-10 max-w-[360px] border-4 border-white"
        alt={txt}
      />
    </a>
  </div>
{/if}

{#if !showQr || txt.length <= 120}
  <div class="break-all text-center text-secondary text-xl">
    {txt}
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

<Amount {amount} {currency} {rate} {locale} />
