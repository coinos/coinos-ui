<script>
  import { btc, f, sat, s, sats } from "$lib/utils";
  let {
    showQr,
    src,
    link,
    qr = $bindable(),
    txt,
    invoice,
    amount,
    amountFiat,
    currency,
    tip,
    rate
  } = $props();
</script>

{#if showQr}
  <div>
    <a href={link}>
      <img
        {src}
        class="mx-auto z-10 max-w-[360px] border-4 border-white"
        bind:this={qr}
        alt={txt}
      />
    </a>
  </div>
{/if}

{#if !showQr || !txt.startsWith("ln")}
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

{#if amount > 0}
  <div class="text-center font-bold text-2xl">
    <div>
      {f(amountFiat, currency)}

      {#if tip}
        <span class="text-sm">
          +{f(tip * (rate / sats), currency)}
        </span>
      {/if}
    </div>
    <div>
      <span class="text-secondary font-normal text-xl">⚡️{`${s(amount)}`}</span
      >

      {#if tip}
        <span class="text-sm text-secondary font-normal">
          +⚡️{s(tip)}
        </span>
      {/if}
    </div>
  </div>
{/if}
