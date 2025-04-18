<script>
  import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
  import {
    btc,
    loc,
    post,
    copy,
    f,
    fail,
    get,
    types,
    sat,
    s,
    sats,
  } from "$lib/utils";
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

  let { data } = $props();

  let showOptions;

  let reading = async ({ message, serialNumber }) => {
    let name = serialNumber.replace(/:/g, "-");
    let result = await post(`/fund/${name}/withdraw`, { amount, hash, name });
  };

  let readingerror = (e) => console.log("nfc error", e);

  let { id, subject, user } = $state(data);
  let { invoice, src } = $derived(data);
  let { aid, amount, rate, tip, hash, text, type } = $derived(invoice);
  let { memo } = $state(invoice);
  let { username, currency } = $derived(invoice.user);
  let locale = loc(user);

  let tipPercent = $derived(tip ? (tip / amount) * 100 : 0);

  // if (browser && !subbed[id])
  //   send("subscribe", invoice)
  //     .then(() => (subbed[id] = true))
  //     .catch((e) => {
  //       console.log("failed to subscribe to invoice notifications", invoice);
  //       console.log(e);
  //     });

  let subbed = false;

  onMount(async () => {
    if (browser) {
      last.subscribe((v) => {
        if (!v || subbed) return;
        subbed = true;
        send("subscribe", invoice);
      });

      if ($amountPrompt && !amount) toggleAmount();
    }
  });

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
    } catch (e) {
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

  let newAmount = $state(0);
  let settingAmount = $state();
  let toggleAmount = () => (settingAmount = !settingAmount);

  let setAmount = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    settingAmount = false;

    if (typeof $amountPrompt === "undefined") $amountPrompt = true;
    invoice.amount = newAmount;
    invoice.tip = 0;

    await update();
  };

  let setMemo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    settingMemo = false;
    invoice.memo = memo;
    await update();
  };

  let settingMemo = $state();
  let toggleMemo = () => (settingMemo = !settingMemo);

  let fiat = $state(true);
  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
  let tipAmount = $derived(((tip * rate) / sats).toFixed(2));
  let link = $derived(
    [types.bitcoin, types.liquid].includes(type) ? text : `lightning:${text}`,
  );

  let txt = $derived(
    [types.bitcoin, types.liquid].includes(type) ? hash : text,
  );
</script>

<div class="invoice container mx-auto max-w-xl px-4 space-y-2">
  <InvoiceData
    {src}
    {link}
    {txt}
    {invoice}
    {amount}
    {amountFiat}
    {currency}
    {locale}
    {tip}
    {rate}
    showQr={$showQr}
    t={$t}
  />

  <InvoiceActions
    bind:newAmount
    {setAmount}
    {setType}
    {toggleType}
    {toggleAmount}
    {toggleMemo}
    {user}
    {invoice}
    {copy}
    {link}
    {type}
    {txt}
    t={$t}
    bind:showQr={$showQr}
  />
</div>

<SetAmount
  bind:newAmount
  bind:fiat
  {currency}
  {locale}
  {rate}
  {settingAmount}
  {setAmount}
  {toggleAmount}
  amountPrompt={$amountPrompt}
  t={$t}
/>

<SetMemo bind:memo {settingMemo} {setMemo} {toggleMemo} t={$t} />

<SetType
  bind:newAmount
  {setAmount}
  {invoice}
  {user}
  {type}
  {settingType}
  {setType}
  {toggleType}
  t={$t}
/>
