<script lang="ts">
  import { copy, s, f, toFiat } from "$lib/utils";
  import { fiat } from "$lib/store";
  const {
    align = "",
    amount,
    locale = undefined,
    tip = undefined,
    rate,
    currency,
    locked = false,
  }: any = $props();

  const icon = $derived(locked ? "ph:lock-fill" : "ph:lightning-fill");
  const canShowFiat = $derived($fiat && rate && currency);

  const toggleFiat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    $fiat = !$fiat;
  };
</script>

{#if typeof amount !== "undefined"}
  <div>
    <h2
      class="text-2xl md:text-3xl font-semibold flex items-end"
      class:justify-center={align !== "left"}
    >
      <button
        type="button"
        class="flex items-center"
        onclick={toggleFiat}
        aria-label="Toggle currency display"
      >
        <iconify-icon noobserver {icon} class="text-yellow-300" class:hidden={canShowFiat}></iconify-icon>
        <span class:hidden={!canShowFiat}>{f(toFiat(amount, rate), currency, locale)}</span>
        <span class:hidden={canShowFiat}>{s(amount, locale)}</span>
      </button>

      {#if tip}
        <div class="flex items-center text-lg ml-2">
          <div>+</div>
          <div class="font-semibold">
            <span class:hidden={!canShowFiat}>{f(toFiat(tip, rate), currency, locale)}</span>
            <span class:hidden={canShowFiat}>{s(tip, locale)}</span>
          </div>
        </div>
      {/if}
    </h2>
  </div>
{/if}
