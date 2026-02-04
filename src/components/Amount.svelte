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
    showFiat = true,
  } = $props();

  const icon = $derived(locked ? "ph:lock-fill" : "ph:lightning-fill");
</script>

{#if typeof amount !== "undefined"}
  <div>
    <h2
      class="text-2xl md:text-3xl font-semibold flex items-end cursor-copy"
      class:justify-center={align !== "left"}
    >
      <button
        type="button"
        class="flex items-center"
        onclick={() => copy(amount)}
        aria-label="Copy amount"
      >
        <iconify-icon noobserver {icon} class="text-yellow-300"
        ></iconify-icon>{s(amount, locale)}
      </button>

      {#if tip}
        <div class="flex items-center text-lg ml-2">
          <div>+</div>
          <iconify-icon noobserver {icon} class="text-yellow-300"
          ></iconify-icon>
          <div>{s(tip, locale)}</div>
        </div>
      {/if}
    </h2>
    {#if showFiat}
      <h3
        class="flex text-secondary md:text-lg cursor-copy items-center gap-1"
        class:justify-center={align !== "left"}
      >
        <button
          type="button"
          class="flex items-center gap-1"
          onclick={() => copy(toFiat(amount, rate).toFixed(2))}
          aria-label="Copy fiat amount"
        >
          {f(toFiat(amount, rate), currency, locale)}
          {#if tip}
            <span class="text-base">
              +{f(toFiat(tip, rate), currency, locale)}
            </span>
          {/if}
        </button>
      </h3>
    {/if}
  </div>
{/if}
