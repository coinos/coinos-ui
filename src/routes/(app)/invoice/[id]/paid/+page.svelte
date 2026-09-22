<script>
  import Amount from "$comp/Amount.svelte";
  import Success from "$comp/Success.svelte";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data } = $props();
  let { amount, currency, rate, received, pending, tip, user, id } = $derived(
    data.invoice,
  );
  let locale = $derived(loc(user));

  // `received` is the invoice's running total. For a reusable bolt12 offer that
  // is the LIFETIME figure across every payment the offer has ever taken, so
  // showing it here would announce the accumulated total rather than the payment
  // that just arrived. For those, show the amount the socket reported — it is
  // already net of tip, the same basis as `received - tip`. Single-use invoices
  // keep using `received` so a top-up onto a partly-paid invoice still totals
  // correctly.
  let reusable = $derived(data.invoice?.type === "bolt12");
  let settled = $derived(
    reusable && data.justPaid
      ? Number.parseInt(data.justPaid) + (tip ?? 0)
      : received,
  );

  // toast.pop(0);
</script>

<div class="container px-4 text-center mx-auto">
  {#if pending}
    <iconify-icon
      noobserver
      icon="ph:clock-bold"
      class="text-warning"
      width="160"
    ></iconify-icon>

    <h1 class="text-3xl md:text-4xl font-bold mb-6">Payment detected</h1>

    <Amount amount={pending - tip} {tip} {rate} {currency} {locale} />
  {:else}
    <Success
      amount={settled - tip}
      {rate}
      {tip}
      {currency}
      {locale}
      title={$t("invoice.paymentSuccessful")}
    />
  {/if}
</div>

<a href={`/${user.username}`} aria-label="Continue">
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">
  {$t("payments.tapAnywhere")}
</div>
