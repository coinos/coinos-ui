<script>
  import Amount from "$comp/Amount.svelte";
  import Pin from "$comp/Pin.svelte";
  import { loc, f, toFiat, s, si, sat, sats } from "$lib/utils";
  import { pin } from "$lib/store";
  import { t } from "$lib/translations";

  let show = $state();
  let { user, rate, balance } = $props();
  let { currency } = $derived(user);
  let locale = loc(user);
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

    <Amount amount={balance} {rate} {currency} {locale} align="left" />
  {/if}
</div>
