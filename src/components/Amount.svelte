<script>
  import { s, f, toFiat } from "$lib/utils";
  import { fiat } from "$lib/store";
  const { align, amount, locale, tip, rate, currency } = $props();
</script>

{#if amount}
  <div>
    <h2
      class="text-2xl md:text-3xl font-semibold flex items-end"
      class:justify-center={align !== "left"}
    >
      <div class="flex items-center">
        <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
        ></iconify-icon>{s(amount, locale)}
      </div>

      {#if tip}
        <div class="flex items-center text-lg ml-2">
          <div>+</div>
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
          <div>{s(tip, locale)}</div>
        </div>
      {/if}
    </h2>
    <h3
      class="flex text-secondary md:text-lg"
      class:justify-center={align !== "left"}
    >
      {f(toFiat(amount, rate), currency, locale)}
      {#if tip}
        <span class="text-base">
          + {f(toFiat(tip, rate), currency, locale)}
        </span>
      {/if}
    </h3>
  </div>
{/if}
