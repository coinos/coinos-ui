<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { t, loading } from "$lib/translations";
  import { copy, f, s, loc, toFiat, post, sats, fail, success, types } from "$lib/utils";
  import { fiat } from "$lib/store";

  const toggleFiat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    $fiat = !$fiat;
  };
  import Avatar from "$comp/Avatar.svelte";
  import { format } from "date-fns";
  import { PUBLIC_EXPLORER, PUBLIC_LIQUID_EXPLORER } from "$env/static/public";
  import locales from "$lib/locales";
  import { goto } from "$app/navigation";

  let expanded: Set<string> = $state(new Set());

  let { data } = $props();
  let user = $derived(data.user);
  let p = $derived(data.payment);
  let locale = $derived(user ? locales[user.language] : locales["en"]);
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

  let bump = async () => {
    try {
      await post(`/payment/${id}/bump`, { id });
    } catch (e: any) {
      fail(e.message);
    }
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
      {#if $fiat}
        <div>{f(toFiat(amount, rate), currency, userLocale)}</div>
      {:else}
        <div class="flex items-center">
          <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
          {s(amount, userLocale)}
        </div>
      {/if}
    </button>
  </div>
{/snippet}

{#snippet copyable(label, value, href)}
  <div class="flex justify-between items-center gap-4 py-4 border-b border-base-300 min-h-20">
    <span class="text-secondary shrink-0">{label}</span>
    <div class="flex items-center gap-2 min-w-0">
      <button
        class="font-mono text-sm text-right break-all hover:opacity-80"
        onclick={() => {
          if (expanded.has(label)) {
            expanded.delete(label);
          } else {
            expanded.add(label);
          }
          expanded = new Set(expanded);
        }}
        aria-label={expanded.has(label) ? "Collapse" : "Expand"}
      >
        {#if expanded.has(label)}
          {value}
        {:else}
          {value.slice(0, 8)}...{value.slice(-8)}
        {/if}
      </button>
      <button
        class="shrink-0 hover:opacity-80"
        onclick={() => copy(value)}
        aria-label="Copy {label}"
      >
        <iconify-icon noobserver icon="ph:copy-bold" width="20" class="text-secondary"></iconify-icon>
      </button>
      {#if href}
        <a {href} target="_blank" rel="noreferrer" class="shrink-0 hover:opacity-80" aria-label="View in explorer">
          <iconify-icon noobserver icon="ph:arrow-square-out-bold" width="20" class="text-secondary"></iconify-icon>
        </a>
      {/if}
    </div>
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
      {#if $fiat}
        {f(toFiat(a, rate), currency, userLocale)}
      {:else}
        <span class="flex items-center">
          <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
          {s(a, userLocale)}
        </span>
      {/if}
    </button>
    <div class="text-secondary">
      {format(new Date(created), "MMM d, yyyy", { locale })} &middot; {format(new Date(created), "h:mmaaa", { locale })}
    </div>
  </div>

  {#if p.with}
    <a href={`/${p.with.username}`} class="flex items-center gap-3 py-3 border-b border-base-300">
      <span class="text-secondary">{direction}</span>
      <div class="flex items-center gap-2 ml-auto">
        <Avatar user={p.with} size={20} disabled={true} />
        <span>{p.with.username}</span>
      </div>
    </a>
  {/if}

  <div class="mt-2">
    {#if tip}
      {@render field("payments.amount", a)}
      {@render field("invoice.tip", tip)}
      {@render field("payments.total", a + (tip || 0))}
    {/if}

    {@render field("payments.networkFee", fee)}

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
          <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
          {$t("payments.viewFund")}
        </a>
      </div>
    {:else if memo?.includes("9734")}
      {@const eid = JSON.parse(memo).tags.find((t) => t[0] === "e")[1]}
      <div class="pt-4">
        <a href={`/e/${eid}`} class="btn btn-accent w-full">
          <img src="/images/nostr.png" class="w-6" alt="Nostr" />
          <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
          {$t("payments.zappedEvent")}
        </a>
      </div>
    {:else if memo}
      <div class="flex justify-between items-start gap-4 py-3 border-b border-base-300">
        <span class="text-sm text-secondary shrink-0">{$t("payments.memo")}</span>
        <div class="text-right break-all">
          {#if memo.includes("text/plain")}
            {JSON.parse(memo)[0][1]}
          {:else}
            {memo}
          {/if}
        </div>
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

    {#if path}
      {@render copyable("Path", path)}
    {/if}
  </div>
</div>
