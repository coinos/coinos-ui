<script>
  import { enhance } from "$app/forms";
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
  {#if $showQr}
    <div>
      <a
        href={[types.bitcoin, types.liquid].includes(invoice.type)
          ? invoice.text
          : "lightning:" + invoice.text}
      >
        <img
          {src}
          class="mx-auto z-10 max-w-[360px] border-4 border-white"
          bind:this={qr}
          alt={txt}
        />
      </a>
    </div>
  {/if}

  {#if type !== types.lightning || !$showQr}
    <div class="break-all text-center text-xl text-secondary flex">
      <div class="m-auto">{txt}</div>
    </div>
  {/if}

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
        <button class="btn">
          <iconify-icon icon="ph:wallet-bold" width="32" />
          <div class="my-auto">{$t("payments.openLink")}</div>
        </button>
      </a>
    {/if}

    {#if type === types.lightning}
      <div class="w-full flex justify-center gap-2 flex-wrap">
        <button class="btn" on:click={() => ($showQr = !$showQr)}>
          {#if $showQr}
            <iconify-icon icon="ph:text-align-center-bold" width="32" />
          {:else}
            <iconify-icon icon="ph:qr-code-bold" width="32" />
          {/if}
          <div class="my-auto">
            {$showQr ? $t("payments.showText") : $t("payments.showQr")}
          </div></button
        >
      </div>
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
