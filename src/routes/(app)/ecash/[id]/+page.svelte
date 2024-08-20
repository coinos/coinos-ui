<script>
  import AppHeader from "$comp/AppHeader.svelte";
  import { getDecodedToken } from "@cashu/cashu-ts";
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { page } from "$app/stores";

  export let data;

  let { id, rates, user, token, total, spent } = data;
  let currency = user?.currency || "USD";
  let rate = rates[currency];

  let { proofs } = getDecodedToken(token).token[0];
  let amount = total - spent;

  let link = $page.url.href;

  $: amountFiat = parseFloat(((amount * rate) / sats).toFixed(2));
  $: spentFiat = parseFloat(((spent * rate) / sats).toFixed(2));
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

  {#if spent > 0}
    <div class="text-center font-bold text-2xl">
      <div>
        {f(spentFiat, currency)}
        <span class=" text-red-600">{$t("payments.spent")}</span>
      </div>
      <div>
        <span class="text-secondary font-normal text-xl"
          >⚡️{`${s(spent)}`}</span
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

    {#if spent < total}
      <a href={`/voucher/${id}`} class="contents">
        <button
          type="button"
          class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
        >
          <Icon icon="receive" style="w-8 my-auto" />
          <div class="my-auto">{$t("payments.redeem")}</div>
        </button>
      </a>
    {/if}

    <button
      class="border rounded-2xl px-6 py-5 w-full break-all text-xl hover:bg-slate-100"
      on:click={() => copy(token)}
    >
      {token}
    </button>
  </div>
</div>
