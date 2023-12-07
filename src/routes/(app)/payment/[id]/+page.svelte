<script>
  import { t } from "$lib/translations";
  import {
    back,
    copy,
    f,
    s,
    fiat,
    post,
    sats,
    success,
    types,
  } from "$lib/utils";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import { format } from "date-fns";
  import { PUBLIC_EXPLORER as expl } from "$env/static/public";

  export let data;
  let { user, payment: p } = data;

  let { username } = user;
  let { id, amount, created, rate, type, ref, tip, ourfee, fee, currency } = p;
  let a = Math.abs(amount);

  let print = async () => {
    await post(`/payment/${id}/print`, { id });
    success("Printing!");
  };

  fee = fee || 0;

  let direction = amount > 0 ? $t("payments.from") : $t("payments.to");
  direction =
    direction[0].toUpperCase() + direction.substr(1, direction.length);
</script>

<a href={`/${username}/payments`}>
  <button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80">
    <Icon icon="arrow-left" style="w-10" />
  </button>
</a>

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
      <span class="text-lg text-secondary">Total</span>
      <div>
        {f(fiat(a + (tip || 0), rate), currency)}
        <span class="text-secondary text-lg">⚡️{`${s(a + (tip || 0))}`} </span>
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">Network fee</span>
    <div>
      {f(fiat(fee, rate), currency)}
      <span class="text-secondary text-lg">⚡️{`${s(fee)}`}</span>
    </div>
  </div>

  {#if ourfee > 0}
    <div>
      <span class="text-lg text-secondary">Platform fee</span>
      <div>
        {f(fiat(ourfee, rate), currency)}
        <span class="text-secondary">⚡️{`${s(ourfee)}`}</span>
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">Date</span>
    <div>
      {format(new Date(created), "MMMM d")},
      {format(new Date(created), "h:mm aaa")}
    </div>
  </div>

  {#if type === "bitcoin"}
    <div>
      <span class="text-lg text-secondary">Txid</span>
      <div class="flex">
        <div>
          <a href={`${expl}/tx/${id}`} target="_blank" rel="noreferrer">{id}</a>
        </div>
        <button
          class="flex font-bold hover:opacity-80 mb-auto my-auto"
          on:click={() => copy(id)}
          ><Icon icon="copy" style="ml-2 w-20 my-auto" />


        </button>
      </div>
    </div>
  {/if}

  {#if user.hasprinter}
    <div>
      <button
        class="rounded-full border py-3 px-6 hover:opacity-80 flex w-full md:w-60"
        on:click={print}>
        <div class="mx-auto flex">
          <Icon icon="printer" style="my-auto h-6 mr-2" />
          <div class="my-auto mt-1 text-base">{$t("payments.print")}</div>
        </div>
      </button>
    </div>
  {:else}
    <div>
      <a href={`/payment/${id}/plain`}>
        <button
          class="rounded-full border py-3 px-6 hover:opacity-80 flex w-full md:w-60">
          <div class="mx-auto flex">
            <Icon icon="printer" style="my-auto h-6 mr-2" />
            <div class="my-auto mt-1 text-base">{$t("payments.print")}</div>
          </div>
        </button>
      </a>
    </div>
  {/if}
</div>
