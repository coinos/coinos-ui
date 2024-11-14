<script>
  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import Success from "$comp/Success.svelte";

  let { data } = $props();
  let { amount, rate, tip, user } = $state(data);
  let { currency, username } = user;
  amount = Math.abs(amount);
</script>

<Success {amount} {rate} {tip} {currency} title={`${$t("payments.sent")}!`} />
<a href={`/${username}`} use:focus>
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">
  {$t("payments.tapAnywhere")}
</div>
