<script>
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import { onMount } from "svelte";
  import { format } from "date-fns";
  import { newPayment } from "$lib/store";
  import { t } from "$lib/translations";
  import { get, f, s, sat, sats, types } from "$lib/utils";
  import { page } from "$app/stores";
  import { differenceInDays, getUnixTime, sub } from "date-fns";
  import { goto, invalidate } from "$app/navigation";

  export let data;

  let { start, end, user, rates, payments } = data;

  let change = ({ target: { value } }) => goto(value);
  let link = (p) => {
    if (p.pot) return `/pot/${p.pot}`;
    if (p.with) return "/" + p.with.username;
    return `/p/${p.id}`;
  };

  $: presets = [
    {
      title: $t("payments.day"),
      start: sub(new Date(), { days: 1 }),
      end: null,
    },
    {
      title: $t("payments.week"),
      start: sub(new Date(), { days: 7 }),
      end: null,
    },
    {
      title: $t("payments.month"),
      start: sub(new Date(), { months: 1 }),
      end: null,
    },
    {
      title: $t("payments.all"),
      start: sub(new Date(), { years: 5 }),
      end: null,
    },
  ];

  $: selection = start
    ? presets.findIndex(
        (p) => Math.abs(differenceInDays(new Date(start * 1000), p.start)) < 1
      )
    : 0;

  let p,
    incoming,
    outgoing,
    pages = [];
  $: data &&
    ({ page: p, pages, start, end, incoming, outgoing, payments } = data);

  $: $page && ($newPayment = false);
  $: $newPayment && invalidate(`/users/${user.username}`);

  $: path = $page.params.page
    ? $page.url.pathname.substring(0, $page.url.pathname.lastIndexOf("/"))
    : $page.url.pathname;

  let csv = async () => {
    let url = `/payments`;
    if (start) url += `/${start}`;
    if (end) url += `/${end}`;

    let { payments } = await get(url);

    payments = payments.map((p) => ({
      ...p,
      created: new Date(p.created),
      total: p.amount + (p.tip || 0),
      platform_fee: p.ourfee,
      amount_fiat: f((p.amount * p.rate) / sats, p.currency),
      fee_fiat: p.fee ? f((p.fee * p.rate) / sats, p.currency) : null,
      platform_fee_fiat: p.ourfee ? f((p.ourfee * p.rate) / sats, p.currency) : null,
      tip_fiat: p.tip ? f((p.tip * p.rate) / sats, p.currency) : null,
      total_fiat: f(((p.amount + (p.tip || 0)) * p.rate) / sats, p.currency),
    }));

    let keys = [
      "type",
      "id",
      "created",
      "rate",
      "currency",
      "amount",
      "tip",
      "total",
      "fee",
      "platform_fee",
      "amount_fiat",
      "tip_fiat",
      "total_fiat",
      "fee_fiat",
      "platform_fee_fiat",
    ];

    let csv =
      keys.map((k) => `"${k}"`).join(",") +
      "\n" +
      payments
        .map((r) => keys.map((k) => `"${r[k] || ""}"`).join(","))
        .join("\n");

    let filename = "payments.csv";
    let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
</script>

<div class="mt-24 mb-20 payments">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t("payments.header")}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <div class="flex text-md text-secondary relative">
      <div class="mx-auto flex justify-center w-full gap-1">
        {#each presets as { start, end, title }, i}
          <a
            class:active={selection === i}
            href={`/payments/${getUnixTime(start) + "/"}1`}
          >
            <button
              class="text-sm md:text-lg rounded-full border py-2 px-4 hover:opacity-80 min-w-[72px]"
            >
              <div class="my-auto">{title}</div>
            </button>
          </a>
        {/each}
      </div>
    </div>

    <div class="flex flex-wrap justify-center mb-8">
      {#if pages.length > 1}
        {#each pages as _, i}
          <a
            class="mr-1 last:mr-0"
            href={`${path}/${i + 1}`}
            class:active={parseInt(p) === i + 1}
          >
            <div
              class="border py-2 rounded-full border-2 w-12 h-12 hover:opacity-80 text-center"
            >
              {i + 1}
            </div>
          </a>
        {/each}
      {/if}
    </div>

    <div class="text-base">
      {#each payments as p}
        <a href={`/payment/${p.id}`}>
          <div class="grid grid-cols-12 border-b h-24 hover:bg-gray-100 px-4">
            <div class="whitespace-nowrap my-auto col-span-3">
              <div class="font-bold" class:text-red-800={p.amount < 0}>
                {f(Math.abs(p.amount) * (p.rate / sats), p.currency)}
                {#if p.tip}
                  <span class="text-sm text-secondary">
                    +{Math.round((p.tip / Math.abs(p.amount)) * 100)}%
                  </span>
                {/if}
              </div>

              <div class="text-secondary">
                {sat(Math.abs(p.amount) + (p.tip || 0))}
              </div>
            </div>

            <div
              class="flex my-auto col-span-5 truncate text-ellipsis overflow-hidden mx-auto"
            >
              {#if p.type === types.pot}
                <a href={`/pot/${p.memo}`}>
                  <div class="text-secondary flex">
                    <div class="my-auto mr-1">
                      <img src="/images/moneypot.png" class="w-12" alt="Pot" />
                    </div>

                    <div class="my-auto">Pot</div>
                  </div>
                </a>
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
                <div class="text-secondary flex">
                  {#if [types.ecash, types.lightning].includes(p.type)}
                    <div class="text-3xl">⚡️</div>
                  {:else if p.type === types.bitcoin}
                    <div class="my-auto mr-1">
                      <img
                        src="/images/bitcoin.svg"
                        class="w-12 border-4 border-transparent"
                        alt="Bitcoin"
                      />
                    </div>
                  {:else if p.type === types.liquid}
                    <div class="my-auto mr-1">
                      <img
                        src="/images/liquid.svg"
                        class="w-12 border-4 border-transparent"
                        alt="Liquid"
                      />
                    </div>
                  {/if}

                  <div class="my-auto">
                    {p.amount > 0
                      ? p.confirmed
                        ? "Received"
                        : "Pending"
                      : "Sent"}
                  </div>
                </div>
              {/if}
            </div>

            <div class="text-secondary text-right text-sm my-auto col-span-3">
              <div>
                {format(new Date(p.created), "h:mm aaa")}
              </div>
              <div>
                {format(new Date(p.created), "MMM d, yy")}
              </div>
            </div>
          </div>
        </a>
      {:else}
        <p class="text-secondary text-lg text-center">{$t("payments.empty")}</p>
      {/each}
    </div>

    <div class="grid grid-cols-3 w-full text-center text-lg">
      {#each Object.keys(incoming) as c}
        <span class="text-base text-secondary text-left"></span>
        <!-- <span class="text-base text-secondary" -->
        <!--   >{$t("payments.subtotal")}</span -->
        <!-- > -->
        <span class="text-base text-secondary">
          {#if tipsIn || tipsOut}{$t("payments.tips")}{/if}
        </span>
        <span class="text-base text-secondary"
          >{$t("payments.total")}</span
        >

        {@const totalIn = incoming[c]?.fiat || 0}
        {@const tipsIn = incoming[c]?.fiatTips || 0}
        {@const subtotalIn = totalIn - tipsIn}

        {@const totalOut = -outgoing[c]?.fiat || 0}
        {@const tipsOut = outgoing[c]?.fiatTips || 0}
        {@const subtotalOut = totalOut - tipsOut}

        <span class="text-left text-base text-secondary"
          >{$t("payments.income")}</span
        >
        <!-- <span><b>{subtotalIn ? f(subtotalIn, c) : "-"}</b></span> -->
        <span><b>{tipsIn ? f(tipsIn, c) : "-"}</b></span>
        <span><b>{totalIn ? f(totalIn, c) : "-"}</b></span>

        <span class="text-left text-base text-secondary"
          >{$t("payments.expenditure")}</span
        >
        <!-- <span><b>{subtotalOut ? f(subtotalOut, c) : "-"}</b></span> -->
        <span><b>{tipsOut ? f(tipsOut, c) : "-"}</b></span>
        <span><b>{totalOut ? f(totalOut, c) : "-"}</b></span>
      {/each}
    </div>

    <button
      class="ml-auto rounded-full border py-2 px-4 w-36 hover:opacity-80 flex mx-auto"
      on:click={csv}
    >
      <Icon icon="save" style="opacity-50 mr-2 my-auto" />
      <div class="my-auto">{$t("payments.export")}</div>
    </button>
  </div>
</div>

<style>
  .active * {
    @apply bg-black text-white border-black;
  }

  .payments {
    view-transition-name: payments;
  }
</style>
