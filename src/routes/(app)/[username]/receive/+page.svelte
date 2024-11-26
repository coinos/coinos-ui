<script>
  import { run } from "svelte/legacy";
  import { btc, post, copy, f, get, types, sat, s, sats } from "$lib/utils";
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { last, showQr, amountPrompt } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import InvoiceData from "$comp/InvoiceData.svelte";
  import InvoiceActions from "$comp/InvoiceActions.svelte";
  import InvoiceTypes from "$comp/InvoiceTypes.svelte";
  import SetAmount from "$comp/SetAmount.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";

  let { data } = $props();

  let showOptions;

  let { id, rates, subject, user, text } = $state(data);
  let { src } = $derived(data);

  let { currency, username } = subject;
  let rate = rates[currency];
  let type = types.lightning;
  let hash = "";
  let qr;

  let aid = subject.id;
  let invoice = $state({
    aid,
    type: types.lightning,
    items: [],
    uid: subject.id,
    user: subject,
  });
  let amount = $state(),
    amountFiat,
    tip;

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

  let setAmount = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    settingAmount = false;

    if (typeof $amountPrompt === "undefined") $amountPrompt = true;
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

  let newAmount = $state();
  let settingAmount = $state();
  let fiat = $state(true);
  let toggleAmount = () => (settingAmount = !settingAmount);
  let submit;
  let link = $derived(
    [types.bitcoin, types.liquid].includes(type) ? text : `lightning:${text}`,
  );
  let txt = $derived(
    [types.bitcoin, types.liquid].includes(type) ? hash : text,
  );

  onMount(() => {
    if ($amountPrompt && !amount) toggleAmount();
  });
</script>

<div class="invoice container mx-auto max-w-xl px-4 space-y-2">
  <InvoiceData
    {src}
    {link}
    {qr}
    {txt}
    {invoice}
    {amount}
    {amountFiat}
    {currency}
    {tip}
    {rate}
    showQr={$showQr}
  />

  <InvoiceActions
    {toggleAmount}
    {user}
    {invoice}
    {copy}
    {link}
    {type}
    {types}
    {showQr}
    {txt}
    t={$t}
  />

  <InvoiceTypes {aid} {invoice} {user} {type} {types} {setType} t={$t} />
</div>

<SetAmount
  bind:newAmount
  bind:fiat
  {currency}
  {rate}
  {submit}
  {settingAmount}
  {setAmount}
  {toggleAmount}
  t={$t}
/>
