<script>
  import Success from "$comp/Success.svelte";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { amount, currency, rate, received, pending, tip, user, id } = $derived(
    data.invoice,
  );

  // toast.pop(0);
</script>

<div class="container px-4 text-center mx-auto">
  <Success
    amount={received - tip}
    {rate}
    {tip}
    {currency}
    title={$t("invoice.paymentSuccessful")}
  />

  {#if pending}
    <div class="flex w-full py-5 max-w-[200px] mx-auto">
      <Icon icon="orangeclock" style="mx-auto" />
    </div>

    <h1 class="text-3xl md:text-4xl font-bold mb-6">Payment detected</h1>
    <h2 class="text-2xl md:text-3xl font-semibold">
      {f(toFiat(pending - tip, rate), currency)}
      {#if tip}
        + {f(toFiat(tip, rate), currency)}
      {/if}
    </h2>

    <h3 class="text-secondary md:text-lg mb-6 mt-1">
      ⚡️{s(pending - tip)}
      {#if tip}
        <span class="text-lg">
          + ⚡️{s(tip)}
        </span>
      {/if}
    </h3>
  {/if}
</div>

<a href={`/${user.username}`}>
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">
  {$t("payments.tapAnywhere")}
</div>
