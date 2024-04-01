<script>
    import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
  import {
    btc,
    post,
    back,
    copy,
    f,
    get,
    types,
    sat,
    reverseFormat,
    s,
    sats,
  } from "$lib/utils";
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { last, showQr } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Heart from "$comp/Heart.svelte";
  import Image from "$comp/Image.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";

  export let data;

  let ndef;
  let showOptions;

  let reading = async ({ message, serialNumber }) => {
    let name = serialNumber.replace(/:/g, "-");
    let result = await post(`/fund/${name}/withdraw`, { amount, hash, name });
  };

  let readingerror = (e) => console.log("nfc error", e);

  $: refresh(data);
  let { invoice, id, user, src } = data;
  let {
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
      amount,
      hash,
      type,
      rate,
      text,
      tip,
      user: { username, currency },
    } = invoice);

    tipPercent = (tip / amount) * 100;

    // if (browser && window.NDEFReader) {
    // 	try {
    // 		ndef = new NDEFReader();
    // 		await ndef.scan();
    //
    // 		ndef.removeEventListener('readingerror', readingerror);
    // 		ndef.removeEventListener('reading', reading);
    //
    // 		ndef.addEventListener('readingerror', readingerror);
    // 		ndef.addEventListener('reading', reading);
    // 	} catch (e) {
    // 		console.log(e);
    // 	}
    // }
  };

  $: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
  $: tipAmount = ((tip * rate) / sats).toFixed(2);

  let subbed;

  onMount(async () => {
    $showQr = $showQr && 1;
    if (browser) {
      last.subscribe((v) => {
        if (!v || subbed) return;
        subbed = true;
        send("subscribe", invoice);
      });
    }
  });

  onDestroy(() => {
    if (ndef) {
      ndef.removeEventListener("readingerror", readingerror);
      ndef.removeEventListener("reading", reading);
    }
  });

  $: link = [types.bitcoin, types.liquid].includes(type)
    ? text
    : `lightning:${text}`;
  $: txt = [types.bitcoin, types.liquid].includes(type) ? hash : text;

  let setType = async (type) => {
    invoice.type = type;
    ({ id } = await post(`/${username}/invoice`, {
      invoice,
      user: { username, currency },
    }));

    goto(`./${id}?options=true`, { invalidateAll: true, noScroll: true });
  };
</script>

<div class="invoice container mx-auto max-w-xl px-4 space-y-2">
  {#if $showQr === 1}
    <div>
      <a
        href={[types.bitcoin, types.liquid].includes(invoice.type)
          ? invoice.text
          : "lightning:" + invoice.text}
      >
        <img
          {src}
          class="mx-auto z-10 shadow-inner rounded-2xl"
          bind:this={qr}
          alt={txt}
        />
      </a>
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

  <button
    type="button"
    class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-5 px-6 w-full mx-auto justify-center border bg-black text-white text-xl whitespace-nowrap"
    on:click={() => copy(txt)}
  >
    <Icon icon="copy" style="w-8 my-auto invert" />
    <div class="my-auto font-bold">
      {txt.substr(0, 11)}..{txt.substr(-10)}
    </div>
  </button>

  <div
    class="w-full flex justify-center gap-2 flex-wrap text-secondary text-xl"
  >
    <a href={link} class="w-full">
      <button
        class="w-full flex justify-center rounded-2xl border py-5 px-6 hover:opacity-80"
      >
        <Icon icon="mobile" style="mr-1 w-8" />
        <div class="my-auto">{$t("payments.openLink")}</div>
      </button>
    </a>

    <button
      class="w-full flex justify-center rounded-2xl border py-5 px-6 hover:opacity-80"
      on:click={() => ($showQr = $showQr ? false : 2)}
    >
      <Icon icon="qr" style="w-8 mr-1 invert my-auto" />
      <div class="my-auto">
        {$showQr ? $t("payments.hide") : $t("payments.show")}
        {$t("payments.qr")}
      </div></button
    >

    <!-- <button -->
    <!--   class="w-full flex justify-center rounded-2xl border py-3 px-5 hover:opacity-80 text-lg" -->
    <!--   on:click={() => (showOptions = !showOptions)} -->
    <!-- > -->
    <!--   <Icon icon="settings" style="w-8 mr-1 my-auto" /> -->
    <!--   <div class="my-auto"> -->
    <!--     {showOptions ? $t("payments.hide") : $t("payments.show")} -->
    <!--     {$t("payments.options")} -->
    <!--   </div></button -->
    <!-- > -->
  </div>

  <div class="flex justify-around text-secondary">
    <button
      class="hover:bg-primary my-auto flex gap-1 sm:gap-2 py-3 px-2 sm:px-5 w-full justify-center"
      class:bg-primary={type === types.bitcoin}
      class:text-black={type === types.bitcoin}
      on:click={() => setType(types.bitcoin)}
    >
      <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
      <div class="my-auto text-lg">Bitcoin</div>
    </button>

    <button
      class="hover:bg-primary my-auto flex gap-1 sm:gap-2 py-3 px-2 sm:px-5 w-full justify-center"
      class:bg-primary={type === types.liquid}
      class:text-black={type === types.liquid}
      on:click={() => setType(types.liquid)}
    >
      <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
      <div class="my-auto text-lg">Liquid</div>
    </button>

    <button
      class="hover:bg-primary flex gap-1 sm:gap-2 py-3 px-2 sm:px-5 w-full justify-center"
      class:bg-primary={type === types.lightning}
      class:text-black={type === types.lightning}
      on:click={() => setType(types.lightning)}
    >
      <div class="bg-white rounded-full w-8 h-8 text-center flex">
        <div class="m-auto">⚡️</div>
      </div>
      <div class="my-auto text-lg">Lightning</div>
    </button>
  </div>

  {#if type === types.liquid}
    <div class="flex justify-center">
      <div class="my-auto text-xl text-center text-secondary">
        {$t("payments.onlyLbtc")}
        <span class="text-teal-500 font-bold">L-BTC</span>,
        {$t("payments.dontDeposit")}
      </div>
    </div>
  {/if}

  {#if $showQr === 2}
    <div>
      <a
        href={[types.bitcoin, types.liquid].includes(invoice.type)
          ? invoice.text
          : "lightning:" + invoice.text}
      >
        <img
          {src}
          class="mx-auto z-10 shadow-inner rounded-2xl"
          bind:this={qr}
          alt={txt}
        />
      </a>
    </div>
  {/if}
</div>

<style>
  .invoice {
    view-transition-name: invoice;
  }
</style>
