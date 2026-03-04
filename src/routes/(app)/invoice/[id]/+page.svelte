<script lang="ts">
  import { getWallet } from "$lib/ark";
  import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
  import { btc, loc, post, copy, f, fail, success, get, types, sat, s, sats } from "$lib/utils";
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { last, lastPayment, showQr, amountPrompt } from "$lib/store";
  import { page } from "$app/stores";
  import Avatar from "$comp/Avatar.svelte";
  import InvoiceData from "$comp/InvoiceData.svelte";
  import InvoiceActions from "$comp/InvoiceActions.svelte";
  import SetAmount from "$comp/SetAmount.svelte";
  import SetMemo from "$comp/SetMemo.svelte";
  import SetType from "$comp/SetType.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";

  let { data }: any = $props();

  let showOptions;

  let reading = async ({ message, serialNumber }) => {
    let name = serialNumber.replace(/:/g, "-");
    let result = await post(`/fund/${name}/withdraw`, { amount, hash, name });
  };

  let readingerror = (e) => console.log("nfc error", e);

  let id = $derived(data.id);
  let subject = $derived(data.subject);
  let user = $derived(data.user);
  let hasArk = $derived(data.hasArk);
  let invoice = $derived(data.invoice);
  let src = $derived(data.src);
  let { aid, amount, rate, tip, hash, text, type } = $derived(invoice);
  let memo = $state();
  let { username, currency } = $derived(invoice.user);
  let locale = $derived(loc(user));

  let lnurlMode = $state(false);
  let lnAddress = $derived(`${username}@${$page.url.host}`);

  $effect(() => {
    if ($page.url.searchParams.has("lnurl")) {
      lnurlMode = true;
      $showQr = true;
    } else {
      lnurlMode = false;
    }
  });

  let tipPercent = $derived(tip ? (tip / amount) * 100 : 0);

  $effect(() => {
    if (typeof memo === "undefined") memo = invoice.memo;
  });

  // if (browser && !subbed[id])
  //   send("subscribe", invoice)
  //     .then(() => (subbed[id] = true))
  //     .catch((e) => {
  //       console.log("failed to subscribe to invoice notifications", invoice);
  //       console.log(e);
  //     });

  let subbed = false;

  $effect(() => {
    if (!browser) return;
    last.subscribe((v) => {
      if (!v || subbed) return;
      subbed = true;
      send("subscribe", invoice);
    });
  });

  onMount(async () => {
    if (!browser) return;
    if ($amountPrompt && !amount) toggleAmount();
  });

  let update = async (changes: any = {}) => {
    try {
      const result = await post(`/invoice`, {
        invoice: { ...$state.snapshot(invoice), ...changes },
        user: { username, currency },
      });

      let url = `/invoice/${result.id}`;
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
    if (type === types.lightning && !amount && typeof newAmount === "undefined") {
      lnurlMode = true;
      settingType = false;
      return;
    }

    const changes: any = { type, address_type };
    if (typeof newAmount !== "undefined") changes.amount = newAmount;

    if (type === "ark" && invoice.aid !== invoice.uid) {
      const wallet = await getWallet();
      changes.hash = await wallet.getAddress();
    }

    await update(changes);
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
    const changes: any = { amount: newAmount, tip: 0 };
    if (lnurlMode) changes.type = types.lightning;

    await update(changes);
  };

  let setMemo = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    settingMemo = false;
    await update({ memo });
  };

  let settingMemo = $state();
  let toggleMemo = () => (settingMemo = !settingMemo);

  let fiat = $state(true);
  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
  let tipAmount = $derived(((tip * rate) / sats).toFixed(2));

  let displayInvoice = $derived(
    lnurlMode
      ? { ...invoice, text: lnAddress, type: types.lightning, items: [] }
      : invoice,
  );

  let link = $derived(
    lnurlMode
      ? `lightning:${lnAddress}`
      : [types.bitcoin, types.liquid].includes(type)
        ? text
        : `lightning:${text}`,
  );

  let txt = $derived(
    lnurlMode
      ? lnAddress
      : [types.bitcoin, types.liquid].includes(type)
        ? hash
        : text,
  );

  $effect(() => {
    if (lnurlMode && $lastPayment?.iid) {
      const { iid, confirmed } = $lastPayment;
      const target = confirmed ? `/invoice/${iid}/paid` : `/invoice/${iid}`;
      $lastPayment = null;
      goto(target);
    }
  });
</script>

<div class="invoice container mx-auto max-w-xl px-4 pb-4 space-y-2">
  <InvoiceData
    {src}
    {link}
    {txt}
    invoice={displayInvoice}
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
    invoice={displayInvoice}
    {copy}
    {link}
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
  {hasArk}
  {type}
  {settingType}
  {setType}
  {toggleType}
  {lnurlMode}
  t={$t}
/>
