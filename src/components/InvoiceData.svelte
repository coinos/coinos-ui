<script>
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
    tip,
    rate,
  } = $props();
</script>

{#if showQr}
  <div>
    <a href={link}>
      <img
        {src}
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

{#if amount > 0}
  <div class="text-center font-bold text-2xl">
    <div class="flex justify-center items-end gap-2">
      <div>{f(amountFiat, currency)}</div>

      {#if tip}
        <div class="text-base flex items-center gap-1">
          <div>+</div>
          <div>{f(tip * (rate / sats), currency)}</div>
        </div>
      {/if}
    </div>
    <div class="flex justify-center items-end text-secondary font-normal text-xl gap-2">
      <div class="flex items-center">
        <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
        ></iconify-icon>
        <div>
          {`${s(amount)}`}
        </div>
      </div>
      {#if tip}
        <div class="text-base flex items-center">
          <div>+</div>
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
          <div>{s(tip)}</div>
        </div>
      {/if}
    </div>
  </div>
{/if}
