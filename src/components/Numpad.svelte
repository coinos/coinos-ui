<script>
  import { onMount } from "svelte";
  import { fiat } from "$lib/store";
  import Left from "$comp/Left.svelte";
  import Icon from "$comp/Icon.svelte";
  import { f, s, focus, warning, sat, sats } from "$lib/utils";
  import { t } from "$lib/translations";

  export let amount = 0,
    currency,
    element,
    rate,
    submit = undefined;

  export let amountFiat = 0;

  let arrow = "<";

  $: update(amount, amountFiat);
  let update = (a, f) => {
    if ($fiat) {
      amount = Math.round(f / (rate / sats));
    } else {
      amountFiat = ((a * rate) / sats).toFixed(2);
    }
  };

  let loading = false;

  let symbol =
    {
      USD: "$",
      CAD: "$",
      AUD: "$",
      NZD: "$",
      MXN: "$",
      BRL: "R$",
      HKD: "$",
      TWD: "$",
      JPY: "¥",
      CNY: "¥",
      GBP: "£",
      EUR: "€",
      KRW: "₩",
    }[currency] || "";

  const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

  const handleInput = (value) => {
    if (selecting) amount = 0;
    selecting = false;

    if ($fiat) {
      if (amountFiat === 0 && value !== "." && value !== "<" && value !== "0") {
        amountFiat = value;
      } else if ((amountFiat === 0 || amountFiat === "0") && value === "0") {
        return;
      } else if (amountFiat === 0 && value === ".") {
        amountFiat = "0.";
      } else if (
        amountFiat !== 0 &&
        amountFiat.includes(".") &&
        value === "."
      ) {
        return;
      } else if (value === "<") {
        if (amountFiat !== 0) {
          amountFiat = amountFiat.slice(0, amountFiat.length - 1);
          if (amountFiat.length === 0) {
            amountFiat = 0;
            amount = 0;
          }
        }
      } else if (
        value !== "." &&
        value !== "<" &&
        parseInt(amountFiat + value) > rate
      ) {
        warning($t("user.receive.lessThan1BTCWarning"));
      } else if (amountFiat !== 0 && amountFiat.match(/\.../)) {
        return;
      } else {
        amountFiat = amountFiat + value;
      }
    } else {
      if (value === ".") {
        return;
      } else if (!amount && value !== "<" && value !== "0") {
        amount = parseInt(value);
      } else if (value === "<") {
        if (amount !== 0) {
          amount = Math.floor(amount / 10);
          if (amount.length === 0) {
            amount = 0;
            amountFiat = 0;
          }
        }
      } else if (value !== "<" && parseInt(amount + value) > sats) {
        warning($t("user.receive.lessThan1BTCWarning"));
      } else {
        amount = parseInt(amount.toString() + value);
      }
    }
  };

  $: html = $fiat ? amountFiat : s(amount);

  let prev = "";

  let input = (e) => {
    if (prev === "0" && html !== "0.") {
      prev = "";
      html = html.replace("0", "");
    }

    let sel = getSelection();
    let i = sel.focusOffset;

    let clean = html
      .substr(0, 15)
      .replace(/[^0-9.,]+/g, "")
      .replace(".", "F")
      .replace(/\./g, "")
      .replace("F", ".");

    if ($fiat) clean = clean.replace(",", "");
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

      let node = e.target.childNodes[0];
      let range = document.createRange();

      if (node) {
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
          {#if $fiat}{symbol}{:else}
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
      </div>
      <div
        class="flex items-center justify-center text-2xl cursor-pointer"
        on:click|preventDefault|stopPropagation={swap}
      >
        {#if $fiat}
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
          {s(amount)}
        {:else}
          {f(amountFiat, currency)} {currency}
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
