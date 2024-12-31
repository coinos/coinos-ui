<script>
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import { get, f, s, si, sat, loc, sats, types } from "$lib/utils";
  import { format } from "date-fns";
  import { t } from "$lib/translations";
  import locales from "$lib/locales";
  const { fund, locale, user, payments } = $props();
</script>

<div class="text-base">
  {#each payments as p, i}
    {@const amount = fund ? -p.amount : p.amount}
    <div
      class="grid grid-cols-12 border-b border-base-200 hover:bg-base-200 px-1 py-2 lg:p-4 cursor-pointer"
      class:border-b-0={i === payments.length - 1}
      class:text-error={amount < 0}
      onclick={() => goto(`/payment/${p.id}`)}
    >
      <div class="whitespace-nowrap my-auto col-span-3">
        <div class="font-bold flex items-center">
          <div class="flex items-center">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              width="24"
              class="text-yellow-300"
            ></iconify-icon>
            <div>{s(Math.abs(amount), locale)}</div>
          </div>
        </div>

        <div class="text-secondary flex items-center text-base">
          {f(Math.abs(amount) * (p.rate / sats), p.currency, locale)}

          {#if p.tip}
            <span class="text-sm text-secondary">
              &nbsp;+{Math.round((p.tip / Math.abs(amount)) * 100)}%
            </span>
          {/if}
        </div>
      </div>

      <div
        class="flex my-auto col-span-6 truncate text-ellipsis overflow-hidden mx-auto"
      >
        {#if p.type === types.fund}
          {#if fund}
            <div class="flex">
              <div class="my-auto">
                <Avatar user={p.user} size={12} disabled={true} />
              </div>
              <div class="my-auto ml-1 text-secondary">
                {p.user.username}
              </div>
            </div>
          {:else}
            <a href={`/fund/${p.memo}`}>
              <div class="text-secondary flex">
                <iconify-icon
                  noobserver
                  icon="ph:lightning-fill"
                  class="text-yellow-300 text-3xl"
                ></iconify-icon>

                <div class="my-auto">{$t("payments.fund")}</div>
              </div>
            </a>
          {/if}
        {:else if p.with}
          <div class="flex">
            <div class="my-auto">
              <Avatar user={p.with} size={12} disabled={true} />
            </div>
            <div class="my-auto ml-1 text-secondary">
              {p.with.username}
            </div>
          </div>
        {:else}
          <div class="text-secondary flex items-center gap-1">
            {#if p.type === types.lightning || p.type === types.bolt12}
              <iconify-icon
                noobserver
                icon="ph:lightning-fill"
                class="text-yellow-300 text-3xl"
              ></iconify-icon>
            {:else if p.type === types.ecash}
              <img src="/images/cash.png" class="w-12" />
            {:else if p.type === types.reconcile}
              <iconify-icon noobserver icon="ph:scales-bold" width="32"
              ></iconify-icon>
            {:else if p.type === types.bitcoin}
              <iconify-icon noobserver icon="logos:bitcoin" class="text-3xl"
              ></iconify-icon>
            {:else if p.type === types.liquid}
              <div class="my-auto">
                <img
                  src="/images/liquid.svg"
                  class="w-10 border-4 border-transparent"
                  alt="Liquid"
                />
              </div>
            {/if}

            <div class="my-auto">
              {amount > 0 ? (p.confirmed ? "Received" : "Pending") : "Sent"}
            </div>
          </div>
        {/if}
      </div>

      <div class="text-secondary text-right text-sm my-auto col-span-3">
        <div>
          {format(new Date(p.created), "h:mm aaa", {
            locale: locales[user.language],
          })}
        </div>
        <div>
          {format(new Date(p.created), "MMM d, yy", {
            locale: locales[user.language],
          })}
        </div>
      </div>
    </div>
  {:else}
    <p class="text-secondary text-lg text-center">{$t("payments.empty")}</p>
  {/each}
</div>
