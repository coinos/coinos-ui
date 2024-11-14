<script>
  import { f, focus, s, sat, sats } from "$lib/utils";
  import { scale } from "svelte/transition";
  import Amount from "$comp/Amount.svelte";
  import Icon from "$comp/Icon.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { amount, rate, tip, user } = $state(data);
  let { currency, username } = user;
  amount = Math.abs(amount);

  toast.pop(0);
</script>

<div class="text-center mt-20 md:mt-0">
  <div class="flex w-full max-w-[200px] mx-auto py-4" in:scale={{ start: 0.5 }}>
    <Icon icon="check" style="mx-auto" />
  </div>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">{$t("payments.sent")}!</h1>
  <Amount {amount} {tip} {rate} {currency} />
</div>

<a href={`/${username}`} use:focus>
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center mt-4">
  {$t("payments.tapAnywhere")}
</div>
