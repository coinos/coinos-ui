<script lang="ts">
  import PhClockBold from "virtual:icons/ph/clock-bold";
  import Amount from "$comp/Amount.svelte";
  import Success from "$comp/Success.svelte";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data } = $props();
  let { amount, currency, rate, received, pending, tip, user, id } = $derived(data.invoice);
  let locale = $derived(loc(user));

  let link: HTMLAnchorElement;
  // toast.pop(0);
</script>

<div class="container px-4 text-center mx-auto">
  {#if pending}
    <PhClockBold width="160" class="text-warning mx-auto" />

    <h1 class="text-3xl md:text-4xl font-bold mb-6">Payment detected</h1>

    <Amount amount={pending - tip} {tip} {rate} {currency} {locale} />
  {:else}
    <Success
      amount={received - tip}
      {rate}
      {tip}
      {currency}
      {locale}
      title={$t("invoice.paymentSuccessful")}
    />
  {/if}
</div>

<!-- svelte-ignore a11y_autofocus -->
<a bind:this={link} href={`/${user.username}`} aria-label="Continue" autofocus>
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">{$t("payments.tapAnywhere")}</div>
