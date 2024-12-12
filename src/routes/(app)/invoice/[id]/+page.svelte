<script>
  import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
  import {
    btc,
    loc,
    post,
    copy,
    f,
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
  import InvoiceTypes from "$comp/InvoiceTypes.svelte";
  import SetAmount from "$comp/SetAmount.svelte";
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

  let setType = async (type) => {
    $showQr = true;
    if (type === types.lightning && !amount)
      goto(`/${username}/receive`, { invalidateAll: true, noScroll: true });
    else {
      invoice.type = type;
      ({ id } = await post(`/invoice`, {
        invoice,
        user: { username, currency },
      }));

      goto(`/invoice/${id}?options=true`, {
        invalidateAll: true,
        noScroll: true,
      });
    }
  };

  let setAmount = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    settingAmount = false;

    if (typeof $amountPrompt === "undefined") $amountPrompt = true;
    invoice.amount = newAmount;
    invoice.tip = 0;

    ({ id } = await post(`/invoice`, {
      invoice,
      user: { username, currency },
    }));

    let url = `./${id}`;
    if (subject?.prompt) url += "/tip";
    else url += "?options=true";

    goto(url, { invalidateAll: true, noScroll: true });
  };

  let newAmount = $state(0);
  let settingAmount = $state();
  let toggleAmount = $state(() => (settingAmount = !settingAmount));
  let fiat = $state(true);
  let submit = $state();
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
  />

  <InvoiceActions
    {toggleAmount}
    {user}
    {invoice}
    {copy}
    {link}
    {type}
    {types}
    {txt}
    t={$t}
    bind:showQr={$showQr}
  />

  <InvoiceTypes {aid} {invoice} {user} {type} {types} {setType} t={$t} />
</div>

<SetAmount
  bind:newAmount
  bind:fiat
  {currency}
  {locale}
  {rate}
  {submit}
  {settingAmount}
  {setAmount}
  {toggleAmount}
  amountPrompt={$amountPrompt}
  t={$t}
/>
