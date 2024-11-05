<script>
  import handler from "$lib/handler";
  import { onDestroy, onMount } from "svelte";
  import { t } from "$lib/translations";
  import { goto, invalidateAll } from "$app/navigation";
  import { pin } from "$lib/store";
  import { enhance } from "$app/forms";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import {
    btc,
    sat,
    post,
    back,
    f,
    fiat as toFiat,
    s,
    sats,
    focus,
  } from "$lib/utils";
  export let data;
  export let form;

  let { invoice, rates, user } = data;
  let { address, hash, payreq, user: recipient, tip } = invoice;
  let { currency } = user;

  $: reload(data);
  let reload = (data) => {
    ({ invoice, rates, user } = data);
    ({ address, hash, payreq, user: recipient, tip } = invoice);
    ({ currency } = user);
  };

  $: rate = invoice.rate * (rates[user.currency] / rates[invoice.currency]);

  let amount = form?.amount || invoice.amount;
  let a,
    af,
    amountFiat = amount * (rate / sats),
    fiat = !amount;

  let setAmount = () => {
    amount = a;
    amountFiat = af;
  };

  let submit, submitting;
  let toggle = () => (submitting = !submitting);

  let external = async () => {
    let { id } = await post(`/invoice`, {
      invoice: {
        ...invoice,
        type: "lightning",
        amount,
        currency,
      },
      user: { username: recipient.username },
    });

    goto(`/invoice/${id}?options=true`, {
      invalidateAll: true,
    });
  };

  $: update(form);
  let update = () => {
    if (form?.message?.includes("pin")) $pin = undefined;
    submitting = false;
  };

  // onMount(async () => {
  // 	if (browser && window.NDEFReader && user.nfc) {
  // 		try {
  // 			let ndef = new NDEFReader();
  // 			await ndef.scan();
  //
  // 			ndef.addEventListener('readingerror', (e) => {
  // 				console.log('nfc error', e);
  // 			});
  //
  // 			ndef.addEventListener('reading', ({ message, serialNumber }) => {
  // 				console.log(message, serialNumber);
  // 			});
  // 		} catch (e) {
  // 			console.log('NFC error', e);
  // 		}
  // 	}
  // });
</script>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 max-w-xl mx-auto text-center space-y-5">
  {#if amount}
    <h1 class="text-4xl font-bold">
      {$t("payments.send")}
    </h1>
    <div>
      <h2 class="text-2xl md:text-3xl font-semibold">
        {f(toFiat(amount, rate), currency)}
        {#if tip}
          <span class="text-lg">
            + {f(toFiat(tip, rate), currency)}
          </span>
        {/if}
      </h2>
      <h3 class="text-secondary md:text-lg mt-1">
        ⚡️{s(amount)}

        {#if tip}
          <span class="text-lg">
            + ⚡️{s(tip)}
          </span>
        {/if}
      </h3>
    </div>

    <h1 class="text-xl md:text-2xl text-secondary">
      {$t("payments.to")}
    </h1>

    <div class="flex p-1 gap-2 justify-center">
      <Avatar user={recipient} size={"20"} />
      <p class="text-4xl break-words my-auto">
        {recipient.username}
      </p>
    </div>

    {#if invoice.items.length}
      <h1 class="text-xl md:text-2xl text-secondary">
        {$t("payments.for")}
      </h1>

      {#each invoice.items as i}
        <div class="grid grid-cols-4 text-xl">
          <div class="mr-auto grow col-span-2">
            <span class="mr-2">{i.quantity}</span>
            {i.name}
          </div>
          <div class="font-semibold text-right">
            {f(i.price * i.quantity, invoice.currency)}
          </div>
          <div class="text-secondary text-right text-lg my-auto">
            {sat(btc(i.price * i.quantity, invoice.rate))}
          </div>
        </div>
      {/each}
    {/if}
  {:else}
    <Numpad
      bind:amount={a}
      bind:amountFiat={af}
      {currency}
      bind:fiat
      bind:rate
      {submit}
    />
  {/if}

  <form method="POST" use:enhance={handler(toggle)} class="space-y-2">
    <input name="address" value={address} type="hidden" />
    <input name="amount" value={amount} type="hidden" />
    <input name="payreq" value={payreq} type="hidden" />
    <input name="username" value={recipient.username} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />

    <div class="flex w-full text-xl">
      {#if amount}
        <button
          use:focus
          type="submit"
          class="btn btn-primary"
          disabled={submitting}
        >
          {#if submitting}
            <Spinner />
          {:else}
            {$t("payments.send")}
          {/if}
        </button>
      {:else}
        <button
          bind:this={submit}
          type="button"
          class="btn !w-auto"
          on:click={setAmount}
        >
          {$t("payments.next")}
        </button>
      {/if}
    </div>
    <button type="button" class="btn" on:click={external}
      >{$t("payments.moreOptions")}</button
    >
  </form>
</div>
