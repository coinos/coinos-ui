<script lang="ts">
  import { onMount } from "svelte";
  import { password } from "$lib/store";
  import Amount from "$comp/Amount.svelte";
  import Success from "$comp/Success.svelte";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data } = $props();

  let amount = $derived(data.amount);
  let currency = $derived(data.currency);
  let id = $derived(data.id);
  let user = $derived(data.user);
  let rate = $derived(data.rate);
  let rates = $derived(data.rates);
  let pw = $derived(data.password);
  let locale = $derived(loc(user));

  onMount(() => ($password = pw));
</script>

<div class="container px-4 text-center mx-auto">
  <Success {amount} {rate} {currency} {locale} title={$t("payments.received")} />
</div>

<a href={`/${user.username}`} aria-label="Continue">
  <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">{$t("payments.tapAnywhere")}</div>
