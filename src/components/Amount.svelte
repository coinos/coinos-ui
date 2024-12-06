<script>
  import { copy, s, f, toFiat } from "$lib/utils";
  import { fiat } from "$lib/store";
  const { align, amount, locale, tip, rate, currency } = $props();
</script>

{#if typeof amount !== "undefined"}
  <div>
    <h2
      class="text-2xl md:text-3xl font-semibold flex items-end cursor-copy"
      class:justify-center={align !== "left"}
    >
      <div class="flex items-center" onclick={() => copy(amount)}>
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
      class="flex text-secondary md:text-lg cursor-copy items-center gap-1"
      class:justify-center={align !== "left"}
      onclick={() => copy(toFiat(amount, rate).toFixed(2))}
    >
      {f(toFiat(amount, rate), currency, locale)}
      {#if tip}
        <span class="text-base">
          +{f(toFiat(tip, rate), currency, locale)}
        </span>
      {/if}
    </h3>
  </div>
{/if}
