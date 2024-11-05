<script>
  import { send } from "$lib/socket";
  import { btc, post, copy, f, get, types, sat, s, sats } from "$lib/utils";
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { last, showQr, amountPrompt } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import InvoiceTypes from "$comp/InvoiceTypes.svelte";
  import SetAmount from "$comp/SetAmount.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";

  export let data;

  let showOptions;

  let { id, rates, subject, user, src, text } = data;
  $: refresh(data);
  let refresh = (data) => {
    ({ id, rates, subject, user, src, text } = data);
  };

  let { currency, username } = subject;
  let rate = rates[currency];
  let type = types.lightning;
  let hash = "";

  let qr;

  $: link = [types.bitcoin, types.liquid].includes(type)
    ? text
    : `lightning:${text}`;
  $: txt = [types.bitcoin, types.liquid].includes(type) ? hash : text;

  let aid = subject.id;
  let invoice = {
    aid,
    type: types.lightning,
    items: [],
    user: subject,
  };
  let amount, amountFiat, tip;

  let setType = async (type) => {
    invoice.type = type;
    ({ id } = await post(`/invoice`, {
      invoice,
      user: { username, currency },
    }));

    goto(`/invoice/${id}?options=true`, {
      invalidateAll: true,
      noScroll: true,
    });
  };

  let setAmount = async () => {
    if (typeof $amountPrompt === "undefined") $amountPrompt = true;
    settingAmount = false;
    amount = newAmount;
    invoice.amount = newAmount;
    invoice.tip = 0;
    ({ id } = await post(`/invoice`, {
      invoice,
      user: { username, currency },
    }));

    let url = `/invoice/${id}`;
    if (subject?.prompt) url += "/tip";
    else url += "?options=true";

    goto(url, { invalidateAll: true, noScroll: true });
  };

  let newAmount;
  let settingAmount;
  let toggleAmount = () => (settingAmount = !settingAmount);
  let fiat;
  let submit;
</script>

<div class="invoice container mx-auto max-w-xl px-4 space-y-2">
  {#if $showQr}
    <div>
      <a href={link}>
        <img
          {src}
          class="mx-auto z-10 max-w-[360px] border-4 border-white"
          bind:this={qr}
          alt={txt}
        />
      </a>
    </div>
  {/if}

  <div class="break-all text-center text-secondary text-xl">
    {txt}
  </div>

  {#each invoice.items as i}
    <div class="grid grid-cols-12 text-xl">
      <div class="col-span-1 my-auto">{i.quantity}</div>
      <div class="mr-auto grow col-span-7 my-auto">
        {i.name}
      </div>
      <div class="col-span-2 font-semibold text-right my-auto">
        {f(i.price * i.quantity, currency)}
      </div>
      <div class="col-span-2 text-secondary text-right text-lg my-auto">
        {sat(btc(i.price * i.quantity, rate))}
      </div>
    </div>
  {/each}

  {#if amount > 0}
    <div class="text-center font-bold text-2xl">
      <div>
        {f(amountFiat, currency)}

        {#if tip}
          <span class="text-sm">
            +{f(tip * (rate / sats), currency)}
          </span>
        {/if}
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(amount)}`}</span
        >

        {#if tip}
          <span class="text-sm text-secondary font-normal">
            +⚡️{s(tip)}
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <div class="text-secondary space-y-2 text-xl pt-2">
    <button type="button" class="btn" on:click={() => copy(txt)}>
      <iconify-icon icon="ph:copy-bold" width="32" />
      <div class="my-auto">
        {$t("payments.copy")}
      </div>
    </button>

    {#if user?.id === invoice?.user?.id}
      <button class="btn" on:click={toggleAmount}>
        <iconify-icon icon="ph:pencil-bold" width="32" />
        <div class="my-auto">{$t("payments.setAmount")}</div>
      </button>
    {:else}
      <a href={link} class="w-full">
        <button
          class="w-full flex justify-center rounded-2xl border py-5 px-6 hover:opacity-80"
        >
          <iconify-icon icon="ph:device-mobile-bold" width="32" />
          <div class="my-auto">{$t("payments.openLink")}</div>
        </button>
      </a>
    {/if}
  </div>

  <InvoiceTypes {aid} {user} {type} {types} {setType} t={$t} />
</div>

<SetAmount
  {currency}
  {rate}
  {fiat}
  {submit}
  {settingAmount}
  {setAmount}
  {newAmount}
  {toggleAmount}
  amountPrompt={$amountPrompt}
  t={$t}
/>
