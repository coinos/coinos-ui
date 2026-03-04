<script lang="ts">
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import { t } from "$lib/translations";
  import { s, f, loc, sats } from "$lib/utils";
  import { fiat } from "$lib/store";

  let { data } = $props();
  let funds = $derived(data.funds);
  let user = $derived(data.user);
  let rate = $derived(data.rate);
  let currency = $derived(user?.currency || "USD");
  let locale = $derived(loc(user));
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">Funds</h1>

  <a href="/send/fund" class="block">
    <button type="button" class="btn btn-accent">
      <PhPlusBold width="24" />
      <div class="my-auto">Create a fund</div>
    </button>
  </a>

  {#if funds.length}
    <div class="space-y-3">
      {#each funds as fund}
        <a href={`/fund/${fund.id}`} class="block">
          <div class="flex items-center justify-between p-4 rounded-2xl bg-base-200 hover:bg-base-300">
            <div class="flex items-center gap-3">
              <PhLightningFill width="24" class="text-yellow-300" />
              <div>
                <p class="font-mono text-sm opacity-60">{fund.id.slice(0, 8)}...</p>
                {#if fund.managers > 0}
                  <p class="text-xs opacity-50">{fund.managers} manager{fund.managers > 1 ? 's' : ''}</p>
                {/if}
              </div>
            </div>
            <div class="text-right font-semibold">
              {#if $fiat && rate}
                {f(parseFloat(((fund.amount * rate) / sats).toFixed(2)), currency, locale)}
              {:else}
                {s(fund.amount, locale)} sats
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <p class="text-center opacity-60">No funds yet. Create one to get started.</p>
  {/if}
</div>
