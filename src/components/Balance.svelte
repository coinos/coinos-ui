<script>
  import Pin from "$comp/Pin.svelte";
  import { loc, f, toFiat, s, si, sat, sats } from "$lib/utils";
  import { pin } from "$lib/store";
  import { t } from "$lib/translations";

  let show = $state();
  let { user, rate, balance } = $props();
  let toggleShow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    show = !show;
  };
</script>

{#if show && user.haspin && $pin?.length !== 6}
  <Pin cancel={() => (show = false)} />
{/if}

<div>
  {#if user.haspin && !$pin}
    <button onclick={toggleShow} class="flex gap-2 text-xl">
      <iconify-icon icon="ph:eye-slash-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("user.showBalance")}</div>
    </button>
  {:else}
    <div class="text-4xl font-bold flex items-center">
      <iconify-icon icon="ph:lightning-fill" width="32" class="text-yellow-300"
      ></iconify-icon>
      {s(balance)}
    </div>

    <div class="text-secondary text-xl">
      {#if isNaN(rate)}
        <div class="text-gray-200">&mdash;</div>
      {:else}
        {f(toFiat(balance, rate), user.currency, loc(user))}
      {/if}
    </div>
  {/if}
</div>
