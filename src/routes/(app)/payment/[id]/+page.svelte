<script>
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { t, loading } from "$lib/translations";
  import {
    copy,
    f,
    s,
    loc,
    toFiat,
    post,
    sats,
    fail,
    success,
    types,
  } from "$lib/utils";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import { format } from "date-fns";
  import { PUBLIC_EXPLORER, PUBLIC_LIQUID_EXPLORER } from "$env/static/public";
  import locales from "$lib/locales";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { user, payment: p } = $state(data);
  let locale = user ? locales[user.language] : locales["en"];
  let userLocale = $derived(() => loc(user));

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
    } catch (e) {
      fail(e.message);
    }
  };

  let direction = $state("");
  onMount(() => {
    let a = amount;
    if (type === types.fund) a = 0 - a;
    direction = a > 0 ? $t("payments.from") : $t("payments.to");

    if (direction)
      direction =
        direction[0].toUpperCase() + direction.substr(1, direction.length);
  });
</script>

{#snippet field(title, amount)}
  <div>
    <span class="text-lg text-secondary">{$t(title)}</span>
    <div class="flex gap-2 items-end">
      <div class="flex items-center">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>{s(amount, userLocale)}
      </div>
      <span class="text-secondary text-lg">
        {f(toFiat(amount, rate), currency, userLocale)}
      </span>
    </div>
  </div>
{/snippet}

<div class="container mx-auto max-w-lg px-4 space-y-8 break-all text-2xl">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t(amount < 0 ? "payments.sent" : "payments.received")}
  </h1>

  {#if p.with}
    <a href={`/${p.with.username}`}>
      <span class="text-lg text-secondary my-auto mr-2">{direction}</span>
      <div class="flex">
        <div class="my-auto">
          <Avatar user={p.with} size={20} disabled={true} />
        </div>
        <div class="my-auto ml-1">{p.with.username}</div>
      </div>
    </a>
  {/if}

  {@render field("payments.amount", a)}

  {#if tip}
    {@render field("invoice.tip", tip)}
    {@render field("payments.total", a + (tip || 0))}
  {/if}

  {@render field("payments.networkFee", fee)}

  {#if ourfee > 0}
    {@render field("payments.platformFee", ourfee)}
  {/if}

  <div>
    <span class="text-lg text-secondary">{$t("payments.exchangeRate")}</span>
    <div class="flex justify-left gap-2">
      <div class="text-secondary flex">
        <div class="flex mr-1">
          <div class="my-auto mr-1">1</div>
          <img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
        </div>
        <div>&#61; {f(rate, currency, userLocale, 0, 0)}</div>
      </div>
      <div class="text-secondary flex">
        <div class="flex items-center">
          <iconify-icon
            noobserver
            icon="ph:lightning-fill"
            class="text-yellow-300"
          ></iconify-icon>
          {s((1 * sats) / rate)} =
          {f(1, currency, userLocale, 0, 0)}
        </div>
      </div>
    </div>
  </div>

  <div>
    <span class="text-lg text-secondary">{$t("payments.date")}</span>
    <div>
      {format(new Date(created), "h:mmaaa", { locale })}
      {format(new Date(created), "MMM d, yyyy", { locale })}
    </div>
  </div>

  {#if type === types.ecash && amount < 0}
    <a href={`/ecash/${memo}`} class="btn">
      <img src="/images/cash.png" class="w-8" alt="Cash" />
      <div>{$t("payments.ecashToken")}</div>
    </a>
  {:else if type === types.fund}
    <a href={`/fund/${memo}`} class="btn btn-accent">
      <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"
      ></iconify-icon>{$t("payments.viewFund")}
    </a>
  {:else if memo?.includes("9734")}
    {@const eid = JSON.parse(memo).tags.find((t) => t[0] === "e")[1]}
    <a href={`/e/${eid}`} class="btn btn-accent">
      <img src="/images/nostr.png" class="w-8" alt="Nostr" />
      <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"
      ></iconify-icon>{$t("payments.zappedEvent")}
    </a>
  {:else if memo}
    <div>
      <span class="text-lg text-secondary">{$t("payments.memo")}</span>
      <div>
        {#if memo.includes("text/plain")}
          {JSON.parse(memo)[0][1]}
        {:else}
          {memo}
        {/if}
      </div>
    </div>
  {/if}

  {#if type === types.lightning || type === types.bolt12}
    <div>
      <span class="text-lg text-secondary">{$t("payments.preimage")}</span>
      <div>{ref}</div>
    </div>
  {/if}

  {#if type === "bitcoin" || type === "liquid"}
    <div>
      <span class="text-lg text-secondary">Txid</span>
      <div class="flex">
        <div>
          <a
            href={`${expl}/tx/${txid}${vout ? "#vout=" + vout : ""}`}
            target="_blank"
            rel="noreferrer">{txid}</a
          >
        </div>
        <button
          class="flex font-bold hover:opacity-80 mb-auto my-auto"
          onclick={() => copy(txid)}
        >
          <Icon icon="copy" style="ml-2 w-12 my-auto" />
        </button>
      </div>
    </div>
  {/if}

  {#if path}
    <div>
      <span class="text-lg text-secondary">Path</span>
      <div class="flex">
        <div>{path}</div>
        <button
          class="flex font-bold hover:opacity-80 mb-auto my-auto"
          onclick={() => copy(path)}
        >
          <Icon icon="copy" style="ml-2 w-12 my-auto" />
        </button>
      </div>
    </div>
  {/if}
</div>
