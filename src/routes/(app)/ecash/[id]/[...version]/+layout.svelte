<script>
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";

  let { data, children } = $props();

  let { id, user, token, total, spent, external, mint, rate } = data;
  let currency = user?.currency || "USD";

  let amount = total - spent;

  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
  let spentFiat = $derived(parseFloat(((spent * rate) / sats).toFixed(2)));
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.ecash")}
  </h1>

  {#if amount > 0}
    <div class="text-center font-bold text-2xl">
      <div>
        {f(amountFiat, currency)}
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(amount)}`}</span
        >
      </div>
    </div>
  {/if}

  <div class="text-center text-xl">
    <span class="capitalize">{$t("payments.from")}</span>
    <span class="text-secondary">{mint}</span>
  </div>

  {#if spent > 0}
    <div class="text-center font-bold text-2xl">
      <div>
        {f(spentFiat, currency)}
        <span class=" text-red-600">{$t("payments.spent")}</span>
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(spent)}`}</span
        >
      </div>
    </div>
  {/if}

  {@render children?.()}
</div>
