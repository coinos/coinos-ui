<script>
  import Amount from "$comp/Amount.svelte";
  import Pin from "$comp/Pin.svelte";
  import { loc, f, toFiat, s, si, sat, sats } from "$lib/utils";
  import { pin } from "$lib/store";
  import { t } from "$lib/translations";

  let show = $state();
  let { id, user, rate, balance } = $props();
  let { currency, locked } = $derived(user);
  let locale = $derived(loc(user));
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
      <iconify-icon noobserver icon="ph:eye-slash-bold" width="32"
      ></iconify-icon>
      <div class="my-auto">{$t("user.showBalance")}</div>
    </button>
  {:else if !isNaN(rate)}
    <div class="flex gap-4">
      <Amount
        amount={Math.max(balance - (id === user.id ? locked || 0 : 0), 0)}
        {rate}
        {currency}
        {locale}
        showFiat={false}
        align="left"
      />
      {#if locked && id === user.id}
        <div class="text-red-600">
          <Amount
            amount={locked}
            {rate}
            {currency}
            {locale}
            align="left"
            locked={true}
          />
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-gray-200">&mdash;</div>
  {/if}
</div>
