<script>
  import Icon from "$comp/Icon.svelte";
  import Pin from "$comp/Pin.svelte";
  import { f, s, sat, sats } from "$lib/utils";
  import { pin } from "$lib/store";
  import { t } from "$lib/translations";

  let show;
  export let user, rate;
</script>

{#if show && user.haspin && $pin?.length !== 6}
  <Pin cancel={() => (show = false)} />
{/if}

<div class="space-y-2">
  {#if user.haspin && !$pin}
    <button
      class="flex gap-2 text-xl rounded-2xl border py-5 px-6 hover:opacity-80 bg-black text-white font-bold"
      on:click={() => (show = true)}
    >
      <Icon icon="eye" style="w-8 invert my-auto" />
      <div class="my-auto">{$t("user.showBalance")}</div></button
    >
  {:else}
    <div class="text-5xl font-bold tabular-nums">
      {#if isNaN(rate)}
        <div class="text-gray-200">&mdash;</div>
      {:else}
        {f((user.balance * rate) / sats, user.currency)}
      {/if}
    </div>

    <div class="text-secondary text-2xl">
      ⚡️{s(user.balance)}
    </div>
  {/if}
</div>
