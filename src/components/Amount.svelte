<script>
  import { copy, s, f, toFiat } from "$lib/utils";
  import { fiat } from "$lib/store";
  const {
    align,
    amount,
    locale,
    tip,
    rate,
    currency,
    locked = false,
  } = $props();

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
        {#if !canShowFiat}
          <iconify-icon
            noobserver
            icon={icon}
            class="text-yellow-300"
          ></iconify-icon>
        {/if}
        {#if canShowFiat}
          {f(toFiat(amount, rate), currency, locale)}
        {:else}
          {s(amount, locale)}
        {/if}
      </button>

      {#if tip}
        <div class="flex items-center text-lg ml-2">
          <div>+</div>
          <div class="font-semibold">
            {#if canShowFiat}
              {f(toFiat(tip, rate), currency, locale)}
            {:else}
              {s(tip, locale)}
            {/if}
          </div>
        </div>
      {/if}
    </h2>
  </div>
{/if}
