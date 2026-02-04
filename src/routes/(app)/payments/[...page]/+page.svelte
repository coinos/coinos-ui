<script>
  import Avatar from "$comp/Avatar.svelte";
  import Payments from "$comp/Payments.svelte";
  import { onMount } from "svelte";
  import { format } from "date-fns";
  import { newPayment } from "$lib/store";
  import { t } from "$lib/translations";
  import { get, f, s, si, sat, loc, sats, types } from "$lib/utils";
  import { page } from "$app/stores";
  import { differenceInDays, getUnixTime, sub } from "date-fns";
  import { goto, invalidate } from "$app/navigation";

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

  let locale = $derived(loc(user));

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
      tip: p.amount > 0 ? p.tip : -p.tip,
      created: new Date(p.created),
      total: p.amount + ((p.amount > 0 ? p.tip : -p.tip) || 0),
      platform_fee: p.ourfee,
      amount_fiat: f((p.amount * p.rate) / sats, p.currency),
      fee_fiat: p.fee ? f((p.fee * p.rate) / sats, p.currency) : null,
      platform_fee_fiat: p.ourfee
        ? f((p.ourfee * p.rate) / sats, p.currency)
        : null,
      tip_fiat: p.tip ? f((p.tip * p.rate) / sats, p.currency) : null,
      total_fiat: f(
        ((p.amount + ((p.amount > 0 ? p.tip : -p.tip) || 0)) * p.rate) / sats,
        p.currency,
      ),
    }));

    let keys = [
      "type",
      "ref",
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
            <div
              class="join-item btn !w-auto !btn-sm btn-disabled !bg-base-200"
            >
              ...
            </div>
          {/if}
        {/each}
      {/if}
    </div>

    <Payments {payments} {locale} {user} />

    <div class="grid grid-cols-3 w-full text-center text-lg">
      {#each Object.keys(incoming) as c}
        <span class="text-base text-secondary text-left"></span>
        <!-- <span class="text-base text-secondary" -->
        <!--   >{$t("payments.subtotal")}</span -->
        <!-- > -->
        <span class="text-base text-secondary">
          {#if tipsIn > 0 || tipsOut > 0}{$t("payments.tips")}{/if}
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

        {#if totalIn > 0}
          <span class="text-left text-base text-secondary"
            >{$t("payments.income")}</span
          >
          <!-- <span><b>{subtotalIn ? f(subtotalIn, c) : "-"}</b></span> -->
          <span><b>{tipsIn > 0 ? f(tipsIn, c, locale) : ""}</b></span>
          <span class="text-right"
            ><b>{totalIn > 0 ? f(totalIn, c, locale) : "-"}</b></span
          >
        {/if}

        {#if totalOut > 0}
          <span class="text-left text-base text-secondary"
            >{$t("payments.expenditure")}</span
          >
          <!-- <span><b>{subtotalOut ? f(subtotalOut, c) : "-"}</b></span> -->
          <span><b>{tipsOut > 0 ? f(tipsOut, c, locale) : "-"}</b></span>
          <span class="text-right"
            ><b>{totalOut > 0 ? f(totalOut, c, locale) : "-"}</b></span
          >
        {/if}
      {/each}
    </div>
  </div>

  {#if payments.length}
    <div class="flex justify-center">
      <button class="btn !w-auto" onclick={csv}>
        <iconify-icon noobserver icon="ph:floppy-disk-bold" width="32"
        ></iconify-icon>
        <div class="my-auto">{$t("payments.export")}</div>
      </button>
    </div>
  {/if}
</div>
