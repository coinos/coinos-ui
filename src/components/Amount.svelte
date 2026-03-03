<script lang="ts">
  import PhLockFill from "virtual:icons/ph/lock-fill";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
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
        {#if !canShowFiat}
          {#if locked}
            <PhLockFill class="text-yellow-300" />
          {:else}
            <PhLightningFill class="text-yellow-300" />
          {/if}
        {/if}
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
