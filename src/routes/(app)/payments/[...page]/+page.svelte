<script>
  import { run } from "svelte/legacy";
  import Avatar from "$comp/Avatar.svelte";
  import { onMount } from "svelte";
  import { format } from "date-fns";
  import { newPayment } from "$lib/store";
  import { t } from "$lib/translations";
  import { get, f, s, si, sat, loc, sats, types } from "$lib/utils";
  import { page } from "$app/stores";
  import { differenceInDays, getUnixTime, sub } from "date-fns";
  import { goto, invalidate } from "$app/navigation";
  import locales from "$lib/locales";
  let { data } = $props();
  let {
    start,
    end,
    user,
    payments,
    incoming,
    outgoing,
    pages,
    page: p,
  } = $derived(data);

  let locale = locales[user.language];
  let userLocale = loc(user);

  let change = ({ target: { value } }) => goto(value);
  let link = (p) => {
    if (p.pot) return `/pot/${p.pot}`;
    if (p.with) return "/" + p.with.username;
    return `/p/${p.id}`;
  };

  let presets = $derived([
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
  ]);

  let selection = $derived(
    presets.findIndex(
      (p) => Math.abs(differenceInDays(new Date(start * 1000), p.start)) < 1,
    ),
  );

  $effect(() => {
    if ($newPayment) {
      $newPayment = false;
      invalidate(`/users/${user.username}`);
    }
  });

  let path = $derived(
    $page.params.page
      ? $page.url.pathname.substring(0, $page.url.pathname.lastIndexOf("/"))
      : $page.url.pathname,
  );

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
      platform_fee_fiat: p.ourfee
        ? f((p.ourfee * p.rate) / sats, p.currency)
        : null,
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

  let showPage = (i) => {
    const currentPage = parseInt(p);
    const maxVisiblePages = 10;

    if (i === 0 || i === pages.length - 1) return true;

    let start = Math.max(
      1,
      currentPage - Math.floor((maxVisiblePages - 4) / 2),
    );
    let end = start + maxVisiblePages - 5;

    if (end >= pages.length - 1) {
      end = pages.length - 2;
      start = Math.max(1, end - (maxVisiblePages - 5));
    }

    return i >= start && i <= end;
  };

  let isEllipsis = (i) =>
    (i === 1 && !showPage(i)) || (i === pages.length - 2 && !showPage(i));
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.header")}
  </h1>

  <div class="container w-full mx-auto text-lg px-2 max-w-xl space-y-2">
    <div class="mx-auto flex justify-center w-full gap-1">
      {#each presets as { start, end, title }, i}
        <a
          href={`/payments/${getUnixTime(start)}/1`}
          class="btn !w-auto"
          class:!btn-active={selection === i}
        >
          {title}
        </a>
      {/each}
    </div>

    <div class="join flex flex-wrap justify-center">
      {#if pages.length > 1}
        {#each pages as _, i}
          {#if showPage(i)}
            <a href={`${path}/${i + 1}`}>
              <div
                class="join-item btn !btn-sm"
                class:btn-active={parseInt(p) === i + 1}
              >
                {i + 1}
              </div>
            </a>
          {:else if isEllipsis(i)}
            <div class="join-item btn !w-auto !btn-sm btn-disabled">...</div>
          {/if}
        {/each}
      {/if}
    </div>

    <div class="text-base">
      {#each payments as p, i}
        <div
          class="grid grid-cols-12 border-b border-base-200 hover:bg-base-200 px-1 py-2 lg:p-4 cursor-pointer"
          class:border-b-0={i === payments.length - 1}
          class:text-error={p.amount < 0}
          onclick={() => goto(`/payment/${p.id}`)}
        >
          <div class="whitespace-nowrap my-auto col-span-3">
            <div class="font-bold flex items-center">
              <div class="flex items-center">
                <iconify-icon
                  icon="ph:lightning-fill"
                  width="24"
                  class="text-yellow-300"
                ></iconify-icon>
                <div>{s(Math.abs(p.amount), userLocale)}</div>
              </div>
            </div>

            <div class="text-secondary flex items-center text-base">
              {f(Math.abs(p.amount) * (p.rate / sats), p.currency, userLocale)}

              {#if p.tip}
                <span class="text-sm text-secondary">
                  &nbsp;+{Math.round((p.tip / Math.abs(p.amount)) * 100)}%
                </span>
              {/if}
            </div>
          </div>

          <div
            class="flex my-auto col-span-6 truncate text-ellipsis overflow-hidden mx-auto"
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
              <div class="text-secondary flex items-center gap-1">
                {#if p.type === types.lightning}
                  <iconify-icon
                    icon="ph:lightning-fill"
                    class="text-yellow-300 text-3xl"
                  ></iconify-icon>
                {:else if p.type === types.ecash}
                  <img src="/images/cash.png" class="w-12" />
                {:else if p.type === types.reconcile}
                  <iconify-icon icon="ph:scales-bold" width="32"></iconify-icon>
                {:else if p.type === types.bitcoin}
                  <iconify-icon icon="logos:bitcoin" class="text-3xl"
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
              {format(new Date(p.created), "h:mm aaa", { locale })}
            </div>
            <div>
              {format(new Date(p.created), "MMM d, yy", { locale })}
            </div>
          </div>
        </div>
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
        <span class="text-base text-secondary text-right"
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
        <span><b>{tipsIn > 0 ? f(tipsIn, c, userLocale) : "-"}</b></span>
        <span class="text-right"
          ><b>{totalIn > 0 ? f(totalIn, c, userLocale) : "-"}</b></span
        >

        <span class="text-left text-base text-secondary"
          >{$t("payments.expenditure")}</span
        >
        <!-- <span><b>{subtotalOut ? f(subtotalOut, c) : "-"}</b></span> -->
        <span><b>{tipsOut > 0 ? f(tipsOut, c, userLocale) : "-"}</b></span>
        <span class="text-right"
          ><b>{totalOut > 0 ? f(totalOut, c, userLocale) : "-"}</b></span
        >
      {/each}
    </div>
  </div>

  <div class="flex justify-center">
    <button class="btn !w-auto" onclick={csv}>
      <iconify-icon icon="ph:floppy-disk-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("payments.export")}</div>
    </button>
  </div>
</div>
