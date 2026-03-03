<script lang="ts">
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import LogosBitcoin from "virtual:icons/logos/bitcoin";
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import { get, f, s, si, sat, loc, sats, types, formatDate } from "$lib/utils";
  import { t } from "$lib/translations";
  import { fiat } from "$lib/store";
  const { fund = undefined, locale, user, payments }: any = $props();
  const language = $derived(user?.language || "en");
</script>

<div class="text-base">
  {#each payments as p, i}
    {@const amount = fund ? -p.amount : p.amount}
    <div
      class="grid grid-cols-12 border-b border-base-200 hover:bg-base-200 px-1 py-2 lg:p-4 cursor-pointer"
      class:border-b-0={i === payments.length - 1}
      class:text-error={amount < 0}
      onclick={() => goto(`/payment/${p.id}`)}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && goto(`/payment/${p.id}`)}
      role="button"
      tabindex="0"
    >
      <div class="whitespace-nowrap my-auto col-span-3">
        <button class="font-bold flex items-center" onclick={(e) => { e.stopPropagation(); $fiat = !$fiat; }}>
          <div class:hidden={!$fiat}>{f(Math.abs(amount) * (p.rate / sats), p.currency, locale)}</div>
          <div class="flex items-center" class:hidden={$fiat}>
            <PhLightningFill width="24" class="text-yellow-300" />
            <div>{s(Math.abs(amount), locale)}</div>
          </div>
        </button>

        {#if p.tip}
          <div class="text-secondary flex items-center text-sm">
            +{Math.round((p.tip / Math.abs(amount)) * 100)}%
          </div>
        {/if}
      </div>

      <div class="flex my-auto col-span-6 truncate text-ellipsis overflow-hidden mx-auto">
        {#if p.type === types.fund}
          {#if fund}
            <div class="flex">
              <div class="my-auto">
                <Avatar user={p.user} size={12} disabled={true} />
              </div>
              <div class="my-auto ml-1 text-secondary">{p.user.username}</div>
            </div>
          {:else}
            <a href={`/fund/${p.memo}`}>
              <div class="text-secondary flex">
                <PhLightningFill class="text-yellow-300 text-3xl" />

                <div class="my-auto">{$t("payments.fund")}</div>
              </div>
            </a>
          {/if}
        {:else if p.with}
          <div class="flex">
            <div class="my-auto">
              <Avatar user={p.with} size={12} disabled={true} />
            </div>
            <div class="my-auto ml-1 text-secondary">{p.with.username}</div>
          </div>
        {:else}
          <div class="text-secondary flex items-center gap-1">
            {#if p.type === types.lightning || p.type === types.bolt12}
              <PhLightningFill class="text-yellow-300 text-3xl" />
            {:else if p.type === types.ecash}
              <img src="/images/cash.png" class="w-12" alt="Ecash" />
            {:else if p.type === types.bitcoin}
              <LogosBitcoin class="text-3xl" />
            {:else if p.type === types.liquid}
              <div class="my-auto">
                <img
                  src="/images/liquid.svg"
                  class="w-10 border-4 border-transparent"
                  alt="Liquid"
                />
              </div>
            {:else if p.type === types.ark}
              <img src="/images/ark.png" class="w-10 h-10 rounded-full object-cover bg-neutral" alt="Ark" />
            {/if}

            <div class="my-auto">
              {#if p.type === types.ecash}
                {amount > 0 ? $t("payments.redeemed") : $t("payments.minted")}
              {:else}
                {amount > 0
                ? p.confirmed
                  ? $t("payments.received")
                  : $t("payments.pending")
                : $t("payments.sent")}
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <div class="text-secondary text-right text-sm my-auto col-span-3">
        <div>
          {formatDate(new Date(p.created), language, { month: "short", day: "numeric", year: "2-digit" })}
        </div>
        <div>
          {formatDate(new Date(p.created), language, { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  {:else}
    <p class="text-secondary text-lg text-center">{$t("payments.empty")}</p>
  {/each}
</div>
