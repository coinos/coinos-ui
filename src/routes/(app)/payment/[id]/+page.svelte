<script>
  import { run } from 'svelte/legacy';

  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { t, loading } from "$lib/translations";
  import {
    copy,
    f,
    s,
    fiat,
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

  let { data } = $props();
  let { user, payment: p } = $state(data);
  let locale = locales[user.language];

  let refresh = (d) => {
    ({ user, payment: p } = d);
    ({
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
      fee,
      currency,
    } = p);

    if (amount > 0) [txid, vout] = ref.split(":");
    else txid = hash;

    if (!fee) fee = 0;
  };

  let { username } = user;
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
    fee,
    currency,
  } = $state(p);
  let a = Math.abs(amount);

  let expl = {
    bitcoin: PUBLIC_EXPLORER,
    liquid: PUBLIC_LIQUID_EXPLORER,
  }[type];

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

  let txid = $state(), vout = $state();
  if (amount > 0) [txid, vout] = ref.split(":");
  else txid = hash;

  let direction = $state("");
  onMount(() => {
    direction = amount > 0 ? $t("payments.from") : $t("payments.to");

    if (direction)
      direction =
        direction[0].toUpperCase() + direction.substr(1, direction.length);
  });
  run(() => {
    refresh(data);
  });
</script>

<div class="container mx-auto max-w-lg px-4 space-y-8 break-all text-2xl">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t(amount < 0 ? "payments.sent" : "payments.received")}
  </h1>

  {#if p.with}
    <div>
      <span class="text-lg text-secondary my-auto mr-2">{direction}</span>
      <a href={`/${p.with.username}`}>
        <div class="flex">
          <div class="my-auto">
            <Avatar user={p.with} size={20} />
          </div>
          <div class="my-auto ml-1">{p.with.username}</div>
        </div>
      </a>
    </div>
  {/if}
  {#if p.type === types.fund}
    <div>
      <span class="text-lg text-secondary my-auto mr-2">{direction}</span>
      <a href={`/fund/${p.memo}`}>
        <div class="flex">
          <div class="my-auto">
            <img src="/images/moneypot.png" class="w-12" alt="Pot" />
          </div>
          <div class="my-auto ml-1">{p.memo}</div>
        </div>
      </a>
    </div>
  {/if}
  <div>
    <span class="text-lg text-secondary">{$t("payments.amount")}</span>
    <div>
      {f(fiat(a, rate), currency)}
      <span class="text-secondary text-lg">
        ⚡️{s(a)}
      </span>
    </div>
  </div>

  {#if tip}
    <div>
      <span class="text-lg text-secondary">{$t("invoice.tip")}</span>
      <div>
        {f(fiat(tip, rate), currency)}
        ({Math.round((tip * 100) / Math.abs(a))}%)
        <span class="text-secondary text-lg">
          ⚡️{s(tip)}
        </span>
      </div>
    </div>

    <div>
      <span class="text-lg text-secondary">{$t("payments.total")}</span>
      <div>
        {f(fiat(a + (tip || 0), rate), currency)}
        <span class="text-secondary text-lg">⚡️{`${s(a + (tip || 0))}`} </span>
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">{$t("payments.networkFee")}</span>
    <div>
      {f(fiat(fee, rate), currency)}
      <span class="text-secondary text-lg">⚡️{`${s(fee)}`}</span>
    </div>
  </div>

  {#if ourfee > 0}
    <div>
      <span class="text-lg text-secondary">{$t("payments.platformFee")}</span>
      <div>
        {f(fiat(ourfee, rate), currency)}
        <span class="text-secondary">⚡️{`${s(ourfee)}`}</span>
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">{$t("payments.date")}</span>
    <div>
      {format(new Date(created), "h:mmaaa", { locale })}
      {format(new Date(created), "MMM d, yyyy", { locale })}
    </div>
  </div>

  {#if type === types.ecash && amount < 0}
    <a href={`/ecash/${memo}`} class="block">
      <button class="btn">
        <img src="/images/cash.png" class="w-8" />
        <div>{$t("payments.ecashToken")}</div>
      </button>
    </a>
  {:else if memo}
    <div>
      <span class="text-lg text-secondary">{$t("payments.memo")}</span>
      <div>{memo}</div>
    </div>
  {/if}

  {#if type === types.lightning}
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
