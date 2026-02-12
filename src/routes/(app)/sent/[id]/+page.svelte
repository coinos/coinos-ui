<script lang="ts">
  import { loc, focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import Success from "$comp/Success.svelte";

  let { data } = $props();
  let rate = $derived(data.rate);
  let tip = $derived(data.tip);
  let user = $derived(data.user);
  let currency = $derived(user.currency);
  let username = $derived(user.username);
  let amount = $derived(Math.abs(data.amount));
  let locale = $derived(loc(user));
</script>

<Success {amount} {rate} {tip} {currency} {locale} title={`${$t("payments.sent")}!`} />
<a href={`/${username}`} use:focus aria-label="Continue">
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">{$t("payments.tapAnywhere")}</div>
