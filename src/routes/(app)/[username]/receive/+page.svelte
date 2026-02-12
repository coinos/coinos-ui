<script lang="ts">
  import { run } from "svelte/legacy";
  import { btc, loc, post, copy, fail, f, get, types, sat, s, sats } from "$lib/utils";
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { last, showQr, amountPrompt } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import InvoiceData from "$comp/InvoiceData.svelte";
  import InvoiceActions from "$comp/InvoiceActions.svelte";
  import SetAmount from "$comp/SetAmount.svelte";
  import SetMemo from "$comp/SetMemo.svelte";
  import SetType from "$comp/SetType.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  let { data }: any = $props();

  let showOptions;

  let id = $state();
  let { rate, subject, user, text } = $derived(data);
  let locale = $derived(loc(user));

  let { currency, username } = $derived(subject);
  let type = types.lightning;
  let hash = "";
  let qr;

  let aid = $derived(subject.id);
  let invoice: any = $derived({
    aid,
    type: types.lightning,
    items: [],
    rate,
    text,
    uid: subject.id,
    user: subject,
  });
  let amount = $state(),
    amountFiat,
    tip;

  let update = async () => {
    try {
      ({ id } = await post(`/invoice`, {
        invoice,
        user: { username, currency },
      }));

      let url = `/invoice/${id}`;
      if (subject?.prompt) url += "/tip";
      else url += "?options=true";

      goto(url, { invalidateAll: true, noScroll: true });
    } catch (e: any) {
      fail(e.message);
    }
  };

  let settingType = $state();
  let toggleType = () => (settingType = !settingType);
  let setType = async (type, address_type) => {
    $showQr = true;
    if (type === types.lightning && !amount && typeof newAmount === "undefined")
      goto(`/${username}/receive`, { invalidateAll: true, noScroll: true });
    else {
      if (typeof newAmount !== "undefined") invoice.amount = newAmount;
      invoice.address_type = address_type;
      invoice.type = type;
      await update();
    }
    settingType = false;
  };

  let setAmount = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    settingAmount = false;

    if (typeof $amountPrompt === "undefined") $amountPrompt = true;
    amount = newAmount;
    invoice.amount = newAmount;
    invoice.tip = null;

    await update();
  };

  let newAmount = $state(0);
  let settingAmount = $state();
  let fiat = $state(true);
  let toggleAmount = () => (settingAmount = !settingAmount);

  let setMemo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    settingMemo = false;
    invoice.memo = memo;
    await update();
  };

  let memo = $state();
  let settingMemo = $state();
  let toggleMemo = () => (settingMemo = !settingMemo);

  let link = $derived([types.bitcoin, types.liquid].includes(type) ? text : `lightning:${text}`);
  let txt = $derived([types.bitcoin, types.liquid].includes(type) ? hash : text);

  onMount(() => {
    if ($amountPrompt && !amount) toggleAmount();
    let address_type = $page.url.searchParams.get("address_type");
    if (address_type) setType(types.bitcoin, address_type);
  });
</script>

<div class="invoice container mx-auto max-w-xl px-4 space-y-2">
  <InvoiceData
    {locale}
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
    t={$t}
  />

  <InvoiceActions
    bind:newAmount
    {setAmount}
    {toggleType}
    {setType}
    {toggleAmount}
    {toggleMemo}
    {user}
    {invoice}
    {copy}
    {link}
    {showQr}
    {txt}
    t={$t}
  />
</div>

<SetAmount
  bind:newAmount
  bind:fiat
  {currency}
  locale={loc(user)}
  {rate}
  {settingAmount}
  {setAmount}
  {toggleAmount}
  t={$t}
/>

<SetMemo bind:memo {settingMemo} {setMemo} {toggleMemo} t={$t} />

<SetType
  {aid}
  {invoice}
  {user}
  {type}
  {settingType}
  {setType}
  {toggleType}
  t={$t}
  bind:newAmount
  {setAmount}
/>
