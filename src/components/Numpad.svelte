<script>
  import { onMount } from "svelte";
  import { fiat } from "$lib/store";
  import Left from "$comp/Left.svelte";
  import Icon from "$comp/Icon.svelte";
  import { f, s, focus, warning, sat, sats } from "$lib/utils";
  import { t } from "$lib/translations";

  export let amount = 0,
    currency = "USD",
    element,
    rate,
    locale,
    submit = undefined;

  export let amountFiat = 0;

  function getCurrencyInfo(locale = "en-US", currency) {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(123456.78);
    const { value: decimal } = parts.find((part) => part.type === "decimal");
    const currencyPart = parts.find((part) => part.type === "currency");
    const symbol = currencyPart ? currencyPart.value : "";

    const firstNumberIndex = parts.findIndex((part) => part.type === "integer");
    const currencyIndex = parts.findIndex((part) => part.type === "currency");
    const position = currencyIndex < firstNumberIndex ? "before" : "after";

    return { symbol, position, decimal };
  }

  function strip(input) {
    const regex = new RegExp(`[^0-9\.]`, "g");
    return input.replace(decimal, ".").replace(regex, "");
  }

  let { decimal, symbol, position } = getCurrencyInfo(locale, currency);

  let arrow = "<";

  $: update(amount, amountFiat);
  let update = (a, f) => {
    if ($fiat) {
      amount = f ? Math.round(strip(f) / (rate / sats)) : 0;
    } else {
      amountFiat = a ? ((a * rate) / sats).toFixed(2) : 0;
    }
  };

  let loading = false;

  const numPad = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    decimal,
    "0",
    "<",
  ];

  const handleInput = (value) => {
    if (value === "<") html = html.substr(0, html.length - 1);
    else html += value;
    input();
  };

  $: html = $fiat ? amountFiat : s(amount);

  let prev = "";

  let input = (e) => {
    if (prev === "0" && html !== `0${decimal}`) {
      prev = "";
      html = html.replace("0", "");
    }

    let sel = getSelection();
    let i = sel.focusOffset;

    if (html[0] === "0") i = html.length;

    if (html.split(decimal)[0][0] === "0" && html.length > 1) {
      html = html.replace("0", "");
      i++;
    }

    if (html[0] === decimal) {
      html = `0${html}`;
      i = html.length;
    }

    if (html.includes(decimal) && html.split(decimal)[1].length > 2) {
      html = html.slice(0, html.indexOf(decimal) + 3);
      i = html.length;
    }

    let d = decimal.replace(".", "\\.");
    let clean = html
      .substr(0, 15)
      .replace(new RegExp(`[^0-9${d}]+`, "g"), "")
      .replace(new RegExp(d), "X")
      .replace(new RegExp(d, "g"), "")
      .replace("X", decimal);

    if (clean !== html) {
      html = clean;
      i = html.length;
    }
    if (amount > sats && html.length > prev.length) {
      html = prev;
      warning($t("user.receive.lessThan1BTCWarning"));
      i--;
    }

    if ($fiat) {
      amountFiat = html;
    } else {
      amount = parseInt(html.replace(/,/g, ""));
    }

    if (!amount) amount = null;

    setTimeout(() => {
      if (!$fiat) {
        let p = prev.split(",")[0].length;
        if (html.length > prev.length && p === 3) i++;
        if (html.length < prev.length && p === 1 && i > 1) i--;
      }

      let node = element.childNodes[0];
      let range = document.createRange();

      if (node) {
        if (i > node.length) i = node.length;
        range.setStart(node, i);
        range.setEnd(node, i);

        let sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      prev = html.toString();
    }, 0);
  };

  let selecting;
  let select = (e) => {
    let range = document.createRange();
    range.selectNodeContents(e.target);
    let sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    selecting = true;
  };

  let blur = () => {
    if (!html) html = "0";
  };

  let keydown = (e) =>
    e.key === "Enter" && (e.preventDefault() || submit.click());

  let swap = () => {
    if ($fiat) {
      amount = parseInt((amountFiat / (rate / sats)).toFixed(0));
    } else {
      amountFiat =
        (amount * (rate / sats)).toFixed(2) > 0.0
          ? (amount * (rate / sats)).toFixed(2)
          : 0;
    }
    $fiat = !$fiat;
  };
</script>

<div class="flex justify-center items-center">
  <div class="space-y-5 w-full">
    <div class="text-center">
      <div
        class="text-5xl md:text-6xl font-semibold tracking-widest flex justify-center"
      >
        <div class="my-auto" class:text-5xl={!$fiat}>
          {#if $fiat}
            {#if position === "before"}
              {symbol}
            {/if}
          {:else}
            <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
            ></iconify-icon>
          {/if}
        </div>
        <div
          use:focus
          contenteditable
          bind:innerHTML={html}
          on:focus={select}
          on:blur={blur}
          on:input={input}
          on:keydown={keydown}
          class="outline-none my-auto"
          bind:this={element}
        />
        {#if $fiat && position === "after"}
          {symbol}
        {/if}
      </div>
      <div
        class="flex items-center justify-center text-2xl cursor-pointer"
        on:click|preventDefault|stopPropagation={swap}
      >
        {#if $fiat}
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
          {s(amount, locale)}
        {:else}
          {f(amountFiat, currency, locale)}
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 w-full mx-auto">
      {#each numPad as value}
        {#if value === arrow}
          <button
            type="button"
            class="btn"
            on:click|preventDefault|stopPropagation={() => handleInput(value)}
          >
            <Left />
          </button>
        {:else}
          <button
            type="button"
            class="btn"
            on:click|preventDefault|stopPropagation={() => handleInput(value)}
            >{value}</button
          >
        {/if}
      {/each}
    </div>
  </div>
</div>
