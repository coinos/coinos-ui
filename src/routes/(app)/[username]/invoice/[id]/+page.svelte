<script>
  import { enhance } from "$app/forms";
  import { send } from "$lib/socket";
  import {
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
  import { last } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Heart from "$comp/Heart.svelte";
  import Image from "$comp/Image.svelte";
  import { t } from "$lib/translations";
  import { goto, invalidate } from "$app/navigation";

  export let data;

  let ndef;

  let reading = async ({ message, serialNumber }) => {
    let name = serialNumber.replace(/:/g, "-");
    let result = await post(`/fund/${name}/withdraw`, { amount, hash, name });
  };

  let readingerror = (e) => console.log("nfc error", e);

  $: refresh(data);
  let { invoice, id, user, sm, lg } = data;
  let {
    amount,
    hash,
    type,
    rate,
    received,
    prompt,
    text,
    tip,
    request_id,
    user: { username, currency },
  } = invoice;

  let showQr = true;
  $: src = sm;

  let qr;
  let tipPercent = 0;

  let refresh = async (data) => {
    ({ invoice, id, user, sm, lg } = data);
    ({
      amount,
      hash,
      type,
      rate,
      received,
      prompt,
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

    goto(`./${id}`, { invalidateAll: true });
  };
</script>

<div class="container mx-auto max-w-xl px-4 space-y-5">
  {#if showQr}
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
  {/if}

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
        <span class="text-secondary font-normal text-lg"
          >{`${sat(amount)}`}</span
        >

        {#if tip}
          <span class="text-sm text-secondary font-normal">
            +{sat(tip)}
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <div class="whitespace-nowrap my-auto ml-auto flex gap-2">
    <button
      class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full flex justify-center"
      class:bg-black={type === types.bitcoin}
      class:text-white={type === types.bitcoin}
      on:click={() => setType(types.bitcoin)}
    >
      <img
        src="/images/bitcoin.svg"
        class="my-auto w-8 border-4 border-transparent"
        alt="Bitcoin"
      />
      <div class="my-auto">Bitcoin</div>
    </button>

    <button
      class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full flex justify-center"
      class:bg-black={type === types.liquid}
      class:text-white={type === types.liquid}
      on:click={() => setType(types.liquid)}
    >
      <img
        src="/images/liquid.svg"
        class="my-auto w-8 border-4 border-transparent"
        alt="Bitcoin"
      />
      <div class="my-auto">Liquid</div>
    </button>

    <button
      class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full"
      class:bg-black={type === types.lightning}
      class:text-white={type === types.lightning}
      on:click={() => setType(types.lightning)}
    >
      ⚡️ Lightning
    </button>
  </div>

  <div class="text-center break-all">
    <a href={link}>
      {txt}
    </a>
  </div>

  <div class="w-full flex justify-center gap-2 flex-wrap">
    <a href={link} class="w-full md:w-auto">
      <button
        class="w-full md:w-auto flex justify-center rounded-full border py-3 px-5 hover:opacity-80"
      >
        <Icon icon="mobile" style="mr-1 w-6" />
        <div class="text-secondary">{$t("payments.openLink")}</div>
      </button>
    </a>

    <button
      class="flex rounded-full justify-center border py-3 px-5 hover:opacity-80 w-full md:w-auto"
      on:click={() => copy(txt)}
    >
      <Icon icon="copy" style="mr-1" />
      <div class="text-secondary">{$t("payments.copyText")}</div></button
    >

    <button
      class="w-full md:w-auto flex justify-center rounded-full border py-3 px-5 hover:opacity-80"
      on:click={() => (showQr = !showQr)}
    >
      <Icon icon="qr" style="mr-1 invert" />
      <div class="text-secondary">
        {showQr ? $t("payments.hide") : $t("payments.show")}
        {$t("payments.qr")}
      </div></button
    >
  </div>
</div>
