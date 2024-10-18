<script>
  import Icon from "$comp/Icon.svelte";
  import Pin from "$comp/Pin.svelte";
  import { f, s, sat, sats } from "$lib/utils";
  import { pin } from "$lib/store";
  import { t } from "$lib/translations";

  let show;
  export let user, rate, balance;
</script>

{#if show && user.haspin && $pin?.length !== 6}
  <Pin cancel={() => (show = false)} />
{/if}

<div>
  {#if user.haspin && !$pin}
    <button
      on:click|preventDefault={() => (show = true)}
      class="flex gap-2 text-xl"
    >
      <Icon icon="eye-off" style="w-8 my-auto" />
      <div class="my-auto">{$t("user.showBalance")}</div>
    </button>
  {:else}
    <div class="text-4xl font-bold tabular-nums">
      {#if isNaN(rate)}
        <div class="text-gray-200">&mdash;</div>
      {:else}
        {f((balance * rate) / sats, user.currency)}
      {/if}
    </div>

    <div class="text-secondary text-xl">
      ⚡️{s(balance)}
    </div>
  {/if}
</div>
