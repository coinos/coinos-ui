<script>
  import AppHeader from "$comp/AppHeader.svelte";
  import { getDecodedToken } from "@cashu/cashu-ts";
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { page } from "$app/stores";

  export let data;

  let { id, rates, user, token } = data;
  let currency = user?.currency || "USD"
  let rate = rates[currency];

  let { proofs } = getDecodedToken(token).token[0];
  let amount = proofs.reduce((a, b) => a + b.amount, 0);

  let link = $page.url.href;

  $: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.ecash")}
  </h1>

  {#if amount > 0}
    <div class="text-center font-bold text-2xl">
      <div>
        {f(amountFiat, currency)}
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(amount)}`}</span
        >
      </div>
    </div>
  {/if}

  <div class="flex flex-wrap gap-2 text-xl">
    <button
      type="button"
      class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
      on:click={() => copy(link)}
    >
      <Icon icon="link" style="w-8 my-auto" />
      <div class="my-auto">{$t("payments.copyLink")}</div>
    </button>

    <!-- TODO we need animated QR's -->
    <!-- <a href={`/qr/${encodeURIComponent(token)}`} class="contents"> -->
    <!--   <button -->
    <!--     type="button" -->
    <!--     class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2" -->
    <!--   > -->
    <!--     <Icon icon="qr" style="w-8 my-auto invert" /> -->
    <!--     <div class="my-auto">{$t("payments.qr")}</div> -->
    <!--   </button> -->
    <!-- </a> -->

    <a href={`/voucher/${id}`} class="contents">
      <button
        type="button"
        class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
      >
        <Icon icon="receive" style="w-8 my-auto" />
        <div class="my-auto">{$t("payments.redeem")}</div>
      </button>
    </a>

    <button
      class="border rounded-2xl px-6 py-5 w-full break-all text-xl hover:bg-slate-100"
      on:click={() => copy(token)}
    >
      {token}
    </button>
  </div>
</div>
