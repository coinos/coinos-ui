<script>
  import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
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

  export let data;

  let showOptions;

  let reading = async ({ message, serialNumber }) => {
    let name = serialNumber.replace(/:/g, "-");
    let result = await post(`/fund/${name}/withdraw`, { amount, hash, name });
  };

  let readingerror = (e) => console.log("nfc error", e);

  $: refresh(data);
  let { invoice, id, subject, user, src } = data;
  let {
    aid,
    amount,
    hash,
    type,
    rate,
    text,
    tip,
    user: { username, currency },
  } = invoice;

  let qr;
  let tipPercent = 0;

  let refresh = async (data) => {
    ({ invoice, id, user, src } = data);
    ({
      aid,
      amount,
      hash,
      type,
      rate,
      text,
      tip,
      user: { username, currency },
    } = invoice);

    if (browser && !subbed[id])
      send("subscribe", invoice)
        .then(() => (subbed[id] = true))
        .catch((e) => {
          console.log("failed to subscribe to invoice notifications", invoice);
          console.log(e);
        });

    tipPercent = (tip / amount) * 100;
  };

  $: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
  $: tipAmount = ((tip * rate) / sats).toFixed(2);

  let subbed = {};

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

  $: link = [types.bitcoin, types.liquid].includes(type)
    ? text
    : `lightning:${text}`;
  $: txt = [types.bitcoin, types.liquid].includes(type) ? hash : text;

  let setType = async (type) => {
    invoice.type = type;
    ({ id } = await post(`/invoice`, {
      invoice,
      user: { username, currency },
    }));

    goto(`./${id}?options=true`, { invalidateAll: true, noScroll: true });
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

    let url = `./${id}`;
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
  <InvoiceData
    bind:src
    bind:link
    bind:qr
    bind:txt
    bind:invoice
    bind:amount
    bind:amountFiat
    bind:currency
    bind:tip
    bind:rate
    bind:showQr={$showQr}
  />

  <InvoiceActions
    bind:toggleAmount
    bind:user
    bind:invoice
    {copy}
    bind:link
    bind:type
    {types}
    bind:txt
    t={$t}
    bind:showQr={$showQr}
  />

  <InvoiceTypes {aid} {user} {type} {types} {setType} t={$t} />
</div>

<SetAmount
  bind:currency
  bind:rate
  bind:fiat
  bind:submit
  bind:settingAmount
  bind:setAmount
  bind:newAmount
  bind:toggleAmount
  amountPrompt={$amountPrompt}
  t={$t}
/>
