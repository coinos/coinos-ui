<script lang="ts">
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import PhArrowSquareOutBold from "virtual:icons/ph/arrow-square-out-bold";
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { t, loading } from "$lib/translations";
  import { copy, f, s, loc, toFiat, post, sats, fail, success, types, formatDate } from "$lib/utils";
  import { fiat } from "$lib/store";

  const toggleFiat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    $fiat = !$fiat;
  };
  import Avatar from "$comp/Avatar.svelte";
  import { PUBLIC_EXPLORER, PUBLIC_LIQUID_EXPLORER } from "$env/static/public";
  import { goto } from "$app/navigation";

  let expanded: Set<string> = $state(new Set());

  let { data } = $props();
  let user = $derived(data.user);
  let p = $derived(data.payment);
  let userLocale = $derived(loc(user));

  let {
    id,
    hash,
    amount,
    created,
    confirmed,
    memo,
    rate,
    type,
    ref,
    path,
    tip,
    ourfee,
    fee = 0,
    currency,
  } = $derived(p);
  let [txid, vout] = $derived(amount > 0 ? ref.split(":") : [hash]);
  let a = $derived(Math.abs(amount));

  let expl = $derived(
    {
      bitcoin: PUBLIC_EXPLORER,
      liquid: PUBLIC_LIQUID_EXPLORER,
    }[type],
  );

  let print = async () => {
    await post(`/payment/${id}/print`, { id });
    success("Printing!");
  };

  let showBump = $state(false);
  let bumpLoading = $state(false);
  let bumpEstimate: any = $state(null);
  let bumpTargetRate = $state(0);
  let bumpError = $state("");

  let canBump = $derived(
    type === "bitcoin" && !confirmed && amount < 0 && p.bumpReserve > 0 && !p.childTxid,
  );

  let fetchEstimate = async (targetRate: number) => {
    bumpTargetRate = targetRate;
    bumpError = "";
    try {
      bumpEstimate = await post("/bump/estimate", { id, targetFeeRate: targetRate });
    } catch (e: any) {
      bumpError = e.message;
    }
  };

  let openBump = async () => {
    showBump = true;
    bumpEstimate = null;
    bumpError = "";
    try {
      const est = await post("/bump/estimate", { id, targetFeeRate: 10 });
      bumpEstimate = est;
      bumpTargetRate = est.fees?.fastestFee || 10;
      await fetchEstimate(bumpTargetRate);
    } catch (e: any) {
      bumpError = e.message;
    }
  };

  let bump = async () => {
    bumpLoading = true;
    bumpError = "";
    try {
      const res = await post("/bump", { id, targetFeeRate: bumpTargetRate });
      p.childTxid = res.txid;
      p.bumpedFee = res.childFee;
      showBump = false;
      success("Transaction bumped!");
    } catch (e: any) {
      bumpError = e.message;
    }
    bumpLoading = false;
  };

  let direction = $state("");
  onMount(() => {
    let a = amount;
    if (type === types.fund) a = 0 - a;
    direction = a > 0 ? $t("payments.from") : $t("payments.to");

    if (direction) direction = direction[0].toUpperCase() + direction.substr(1, direction.length);
  });
</script>

{#snippet field(title, amount)}
  <div class="flex justify-between items-center py-4 border-b border-base-300 min-h-20">
    <span class="text-secondary">{$t(title)}</span>
    <button
      type="button"
      class="flex gap-1 items-center text-right text-lg"
      onclick={toggleFiat}
      aria-label="Toggle currency display"
    >
      <div class:hidden={!$fiat}>{f(toFiat(amount, rate), currency, userLocale)}</div>
      <div class="flex items-center" class:hidden={$fiat}>
        <PhLightningFill width="20" class="text-yellow-300" />
        {s(amount, userLocale)}
      </div>
    </button>
  </div>
{/snippet}

{#snippet copyable(label, value, href = "")}
  {@const toggle = () => { if (expanded.has(label)) expanded.delete(label); else expanded.add(label); expanded = new Set(expanded); }}
  <div
    class="py-4 border-b border-base-300 min-h-20 cursor-pointer"
    onclick={toggle}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && toggle()}
  >
    <div class="flex justify-between items-center gap-4">
      <span class="text-secondary shrink-0">{label}</span>
      <div class="flex items-center gap-2 min-w-0">
        {#if !expanded.has(label)}
          <span class="text-right break-all">
            {#if value.length > 20}
              {value.slice(0, 8)}...{value.slice(-8)}
            {:else}
              {value}
            {/if}
          </span>
        {/if}
        <button
          class="shrink-0 hover:opacity-80"
          onclick={(e) => { e.stopPropagation(); copy(value); }}
          aria-label="Copy {label}"
        >
          <PhCopyBold width="28" class="text-secondary" />
        </button>
        {#if href}
          <a {href} target="_blank" rel="noreferrer" class="shrink-0 hover:opacity-80" onclick={(e) => e.stopPropagation()} aria-label="View in explorer">
            <PhArrowSquareOutBold width="28" class="text-secondary" />
          </a>
        {/if}
      </div>
    </div>
    {#if expanded.has(label)}
      <div class="break-all mt-2">
        {value}
      </div>
    {/if}
  </div>
{/snippet}

<div class="container mx-auto max-w-lg px-4 pb-12">
  <div class="flex flex-col items-center gap-2 mb-8">
    <h1 class="text-2xl font-semibold">
      {$t(amount < 0 ? "payments.sent" : "payments.received")}
    </h1>
    <button
      type="button"
      class="text-4xl font-bold tracking-tight"
      onclick={toggleFiat}
      aria-label="Toggle currency display"
    >
      <span class:hidden={!$fiat}>{f(toFiat(a, rate), currency, userLocale)}</span>
      <span class="flex items-center" class:hidden={$fiat}>
        <PhLightningFill width="20" class="text-yellow-300" />
        {s(a, userLocale)}
      </span>
    </button>
    <div class="text-secondary">
      {formatDate(new Date(created), user?.language, { month: "short", day: "numeric", year: "numeric" })}<span class="mx-3">{formatDate(new Date(created), user?.language, { hour: "numeric", minute: "2-digit" })}</span>
    </div>
  </div>

  {#if p.with}
    <a href={`/${p.with.username}`} class="flex items-center gap-3 py-3 border-b border-base-300">
      <span class="text-secondary">{direction}</span>
      <div class="flex items-center gap-2 ml-auto">
        <Avatar user={p.with} size={12} disabled={true} />
        <span>{p.with.username}</span>
      </div>
    </a>
  {/if}

  <div class="mt-2 [&>*:last-child]:border-b-0">
    {#if tip}
      {@render field("payments.amount", a)}
      {@render field("invoice.tip", tip)}
      {@render field("payments.total", a + (tip || 0))}
    {/if}

    {#if fee > 0}
      {@render field("payments.networkFee", fee)}
    {/if}

    {#if ourfee > 0}
      {@render field("payments.platformFee", ourfee)}
    {/if}

    <div class="flex justify-between items-center py-4 border-b border-base-300 min-h-20">
      <span class="text-secondary">{$t("payments.exchangeRate")}</span>
      <div class="flex gap-3 text-secondary">
        <div class="flex items-center gap-1">
          <span>1</span>
          <img src="/images/bitcoin.svg" class="w-4" alt="Bitcoin" />
          <span>&#61; {f(rate, currency, userLocale, 0, 0)}</span>
        </div>
      </div>
    </div>

    {#if type === types.ecash && amount < 0}
      <div class="pt-4">
        <a href={`/ecash/${memo}`} class="btn w-full">
          <img src="/images/cash.png" class="w-6" alt="Cash" />
          {$t("payments.ecashToken")}
        </a>
      </div>
    {:else if type === types.fund}
      <div class="pt-4">
        <a href={`/fund/${memo}`} class="btn btn-accent w-full">
          <PhLightningFill width="20" class="text-yellow-300" />
          {$t("payments.viewFund")}
        </a>
      </div>
    {:else if memo?.includes("9734")}
      {@const eid = JSON.parse(memo).tags.find((t) => t[0] === "e")[1]}
      <div class="pt-4">
        <a href={`/e/${eid}`} class="btn btn-accent w-full">
          <img src="/images/nostr.png" class="w-6" alt="Nostr" />
          <PhLightningFill width="20" class="text-yellow-300" />
          {$t("payments.zappedEvent")}
        </a>
      </div>
    {:else if memo}
      <div class="flex justify-between items-center gap-4 py-4 border-b border-base-300 min-h-20">
        <span class="text-secondary shrink-0">{$t("payments.memo")}</span>
        <div class="text-right break-all">
          {#if memo.includes("text/plain")}
            {JSON.parse(memo)[0][1]}
          {:else}
            {memo}
          {/if}
        </div>
      </div>
    {/if}

    {#if !confirmed && p.bumpReserve > 0}
      {@render field("Bump Reserve (refundable)", p.bumpReserve)}
    {/if}

    {#if p.childTxid}
      {@render copyable("Child Txid", p.childTxid, `${expl}/tx/${p.childTxid}`)}
    {/if}

    {#if canBump}
      <div class="py-4 border-b border-base-300">
        {#if !showBump}
          <button type="button" class="btn btn-accent w-full" onclick={openBump}>
            Speed up
          </button>
        {:else}
          <div class="space-y-3">
            <h3 class="font-semibold">Speed up transaction</h3>

            {#if bumpEstimate?.fees}
              <div class="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  class="btn btn-sm"
                  class:btn-accent={bumpTargetRate === bumpEstimate.fees.halfHourFee}
                  onclick={() => fetchEstimate(bumpEstimate.fees.halfHourFee)}
                >
                  Fast ({bumpEstimate.fees.halfHourFee})
                </button>
                <button
                  type="button"
                  class="btn btn-sm"
                  class:btn-accent={bumpTargetRate === bumpEstimate.fees.fastestFee}
                  onclick={() => fetchEstimate(bumpEstimate.fees.fastestFee)}
                >
                  Fastest ({bumpEstimate.fees.fastestFee})
                </button>
              </div>

              {#if bumpEstimate.cost !== undefined}
                <div class="text-center text-sm">
                  <span class="text-secondary">Cost:</span>
                  {bumpEstimate.cost} sats from your {p.bumpReserve} sat reserve
                </div>
              {/if}
            {/if}

            {#if bumpError}
              <div class="text-red-600 text-sm text-center">{bumpError}</div>
            {/if}

            <div class="flex gap-2 justify-center">
              <button type="button" class="btn btn-sm" onclick={() => (showBump = false)}>
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-sm btn-accent"
                onclick={bump}
                disabled={bumpLoading || !bumpEstimate || bumpEstimate.cost > p.bumpReserve}
              >
                {bumpLoading ? "Bumping..." : "Confirm bump"}
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if type === types.lightning || type === types.bolt12}
      {@render copyable($t("payments.invoice"), hash)}
      {@render copyable($t("payments.preimage"), ref)}
    {/if}

    {#if type === types.ark && hash}
      {@render copyable("Txid", hash)}
    {/if}

    {#if type === "bitcoin" || type === "liquid"}
      {@render copyable("Txid", txid, `${expl}/tx/${txid}${vout ? "#vout=" + vout : ""}`)}
    {/if}

    {#if (type === "bitcoin" || type === "liquid") && amount > 0 && hash}
      {@render copyable("Address", hash, `${expl}/address/${hash}`)}
    {/if}

    {#if path}
      {@render copyable("Path", path)}
    {/if}
  </div>
</div>
