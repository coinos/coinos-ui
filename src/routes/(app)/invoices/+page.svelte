<script>
  import { copy, loc, s, types } from "$lib/utils";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { invoices, user } = $derived(data);
  let locale = $derived(loc(user));

  let memoText = (memo) =>
    memo?.startsWith("[") ? JSON.parse(memo)[0][1] : memo;
</script>

<div class="container w-full mx-auto px-2 py-4 max-w-3xl">
  <h1 class="text-2xl font-bold mb-4 px-2">{$t("invoice.invoice")}</h1>

  <div
    class="flex items-center gap-3 px-2 py-2 text-secondary text-sm font-medium border-b border-base-200"
  >
    <div class="w-24 sm:w-28 shrink-0">{$t("payments.type")}</div>
    <div class="flex-1 min-w-0">{$t("invoice.invoice")}</div>
    <div class="shrink-0 text-right">
      {$t("payments.received")} / {$t("payments.amount")}
    </div>
  </div>

  {#each invoices as i (i.id)}
    <div
      class="flex items-center gap-3 border-b border-base-200 hover:bg-base-200 px-2 py-3"
    >
      <div class="w-24 sm:w-28 shrink-0 flex items-center gap-2 min-w-0">
        {#if i.type === types.lightning || i.type === types.bolt12}
          <iconify-icon
            noobserver
            icon="ph:lightning-fill"
            width="22"
            class="text-yellow-300 shrink-0"
          ></iconify-icon>
        {:else if i.type === types.bitcoin}
          <iconify-icon
            noobserver
            icon="logos:bitcoin"
            width="22"
            class="shrink-0"
          ></iconify-icon>
        {:else if i.type === types.liquid}
          <img
            src="/images/liquid.svg"
            class="w-[22px] shrink-0"
            alt="Liquid"
          />
        {:else if i.type === types.ecash}
          <img src="/images/cash.png" class="w-[22px] shrink-0" alt="Ecash" />
        {/if}
        <span class="truncate text-sm">{i.type}</span>
      </div>

      <button
        type="button"
        class="flex-1 min-w-0 text-left cursor-pointer"
        onclick={() => copy(i.hash)}
        title={i.hash}
      >
        <div class="truncate font-mono text-sm">{i.hash}</div>
        {#if memoText(i.memo)}
          <div class="truncate text-secondary text-xs mt-0.5">
            {memoText(i.memo)}
          </div>
        {/if}
      </button>

      <div class="shrink-0 text-right whitespace-nowrap tabular-nums">
        <span class="text-secondary">{s(i.received, locale)}</span>
        <span class="text-secondary"> / </span>
        {s(i.amount, locale)}
      </div>
    </div>
  {:else}
    <p class="text-secondary text-lg text-center py-12">
      {$t("payments.empty")}
    </p>
  {/each}
</div>
