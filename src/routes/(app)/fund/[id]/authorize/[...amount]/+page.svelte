<script>
  import { onMount } from "svelte";
  import Amount from "$comp/Amount.svelte";
  import Success from "$comp/Success.svelte";
  import { scale } from "svelte/transition";
  import { toFiat, f, s } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data } = $props();

  let { amount, currency, id, user, rate, rates } = data;
  let locale = $derived(loc(user));
</script>

<div class="container px-4 text-center mx-auto">
  <Success {amount} {rate} {currency} {locale} title="Authorized" />
</div>

<a href={`/fund/${id}`} aria-label="Continue">
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">
  {$t("payments.tapAnywhere")}
</div>
