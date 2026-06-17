<script>
  import { copy, loc, s, types } from "$lib/utils";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { invoices, user } = $derived(data);
  let locale = $derived(loc(user));

  let open = $state({});
  let toggle = (idx) => (open[idx] = !open[idx]);

  let memoText = (memo) => {
    if (!memo?.startsWith("[")) return memo;
    try {
      return JSON.parse(memo)[0][1];
    } catch {
      return memo;
    }
  };
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
    <div class="w-[18px] shrink-0"></div>
  </div>

  {#each invoices as i, idx}
    {@const memo = memoText(i.memo)}
    <div
      class="flex gap-3 border-b border-base-200 hover:bg-base-200 px-2 py-3 cursor-pointer select-none"
      class:items-center={!open[idx]}
      class:items-start={open[idx]}
      onclick={() => toggle(idx)}
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
          <img src="/images/liquid.svg" class="w-[22px] shrink-0" alt="Liquid" />
        {:else if i.type === types.ecash}
          <img src="/images/cash.png" class="w-[22px] shrink-0" alt="Ecash" />
        {/if}
        <span class="truncate text-sm">{i.type}</span>
      </div>

      <div class="flex-1 min-w-0">
        <div
          class="font-mono text-sm"
          class:truncate={!open[idx]}
          class:break-all={open[idx]}
        >
          {i.hash}
        </div>
        {#if memo}
          <div
            class="text-secondary text-xs mt-0.5"
            class:truncate={!open[idx]}
            class:break-all={open[idx]}
          >
            {memo}
          </div>
        {/if}
        {#if open[idx]}
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline"
            onclick={(e) => {
              e.stopPropagation();
              copy(i.hash);
            }}
          >
            <iconify-icon noobserver icon="ph:copy" width="16"></iconify-icon>
            {$t("payments.copy")}
          </button>
        {/if}
      </div>

      <div class="shrink-0 text-right whitespace-nowrap tabular-nums">
        <span class="text-secondary">{s(i.received, locale)}</span>
        <span class="text-secondary"> / </span>
        {s(i.amount, locale)}
      </div>

      <iconify-icon
        noobserver
        icon="ph:caret-down"
        width="18"
        class="shrink-0 text-secondary transition-transform"
        class:rotate-180={open[idx]}
      ></iconify-icon>
    </div>
  {:else}
    <p class="text-secondary text-lg text-center py-12">
      {$t("payments.empty")}
    </p>
  {/each}
</div>
