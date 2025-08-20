<script>
  import { onMount } from "svelte";
  import Left from "$comp/Left.svelte";
  import { f, s, focus, warning, sat, sats } from "$lib/utils";
  import { t } from "$lib/translations";
  import { fiat as fiatStore } from "$lib/store";

  // ---- Props (Svelte 5 runes) ----
  let {
    amount = $bindable(),
    currency = "USD",
    fiat = $bindable(),
    element,
    rate = $bindable(),
    locale,
    submit = undefined,
    amountFiat = 0,
  } = $props();

  // ---- Local state ----
  let fiatDigits = $state("0"); // cents buffer in fiat mode
  let html = $state("0");

  // currency info as reactive state
  let decimalChar = $state(".");
  let symbol = $state("");
  let position = $state("before");

  function getCurrencyInfo(locale = "en-US", currency) {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const parts = formatter.formatToParts(123456.78);
    const { value: decimal } = parts.find((p) => p.type === "decimal");
    const currencyPart = parts.find((p) => p.type === "currency");
    const sym = currencyPart ? currencyPart.value : "";
    const firstNumberIndex = parts.findIndex((p) => p.type === "integer");
    const currencyIndex = parts.findIndex((p) => p.type === "currency");
    const pos = currencyIndex < firstNumberIndex ? "before" : "after";
    return { symbol: sym, position: pos, decimal };
  }

  // reflect external prop/locale changes
  $effect(() => {
    const info = getCurrencyInfo(locale, currency);
    decimalChar = info.decimal;
    symbol = info.symbol;
    position = info.position;
  });

  function formatFiatFromDigits(digits, dec = ".") {
    let d = digits.replace(/\D+/g, "");
    if (!d) d = "0";
    if (d.length > 15) d = d.slice(0, 15);
    if (d.length === 1) d = "0" + d;
    if (d.length === 2) d = "0" + d;
    const whole = d.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
    const cents = d.slice(-2);
    return `${whole}${dec}${cents}`;
  }

  // --- NEW: normalize sats to remove leading zeros but keep single "0"
  function normalizeSats(str) {
    const digits = (str ?? "").replace(/[^\d]/g, "");
    const noLead = digits.replace(/^0+(?=\d)/, "");
    return noLead || "0";
  }

  const updateByMode = () => {
    if (fiat) {
      const numericFiat =
        parseFloat((fiatDigits || "0").replace(/\D/g, "")) / 100;
      amountFiat = isFinite(numericFiat) ? numericFiat.toFixed(2) : "0.00";
      amount = numericFiat ? Math.round((numericFiat * sats) / rate) : 0;
    } else {
      // integer-only sats, already normalized
      const a = parseInt((html || "0").replace(/[^\d]/g, "")) || 0;
      amount = a || 0;
      const fval = amount ? (amount * rate) / sats : 0;
      amountFiat = fval ? fval.toFixed(2) : "0.00";
    }
  };

  const pasted = async () => {
    const txt = (await navigator.clipboard.readText()) ?? "";
    if (fiat) {
      const m = txt.replace(/[^\d.,]/g, "");
      const normalized = m.replace(new RegExp(`[${decimalChar}]`, "g"), ".");
      const val = parseFloat(normalized);
      const cents = isFinite(val) ? Math.round(val * 100) : 0;
      fiatDigits = Math.max(0, cents).toString();
      html = formatFiatFromDigits(fiatDigits, decimalChar);
    } else {
      const clean = normalizeSats(txt);
      html = clean;
      element && (element.innerHTML = html);
    }
    input(null, true);
  };

  let prevHtml = $state("");

  // (kept for completeness; no longer used in sats path)
  function trimTrailingZeros(str) {
    if (!str.includes(".")) return str;
    let out = str.replace(/(\.\d*?[1-9])0+$/, "$1");
    out = out.replace(/\.0*$/, "");
    return out;
  }

  const input = (e, fromPad = false) => {
    if (fiat) {
      if (!fromPad) {
        const raw = (element?.textContent ?? "").replace(/[^\d]/g, "");
        fiatDigits = raw || "0";
      }
      const cents = parseInt(fiatDigits || "0") || 0;
      const numericFiat = cents / 100;
      const satsEstimate = Math.round((numericFiat * sats) / rate);
      if (satsEstimate > sats && html.length > prevHtml.length) {
        fiatDigits = fiatDigits.slice(0, -1) || "0";
        warning($t("user.receive.lessThan1BTCWarning"));
      }
      html = formatFiatFromDigits(fiatDigits, decimalChar);
    } else {
      // integer-only sats, normalize leading zeros
      let clean = normalizeSats(element?.textContent ?? "");
      const maybe = parseInt(clean) || 0;
      if (maybe > sats && clean.length > prevHtml.length) {
        clean = normalizeSats(clean.slice(0, -1));
        warning($t("user.receive.lessThan1BTCWarning"));
      }
      html = clean;
      element && (element.innerHTML = html);
    }

    updateByMode();

    if (!fromPad) {
      queueMicrotask(() => {
        const node = element?.childNodes?.[0];
        if (!node) return;
        const range = document.createRange();
        const sel = getSelection();
        const L = node.length ?? node.textContent?.length ?? 0;
        range.setStart(node, L);
        range.setEnd(node, L);
        sel.removeAllRanges();
        sel.addRange(range);
      });
    }
    prevHtml = html.toString();
  };

  const handleInput = (value) => {
    if (fiat) {
      if (value === arrow) {
        fiatDigits = fiatDigits.length > 1 ? fiatDigits.slice(0, -1) : "0";
      } else if (value === "00") {
        fiatDigits = (fiatDigits === "0" ? "" : fiatDigits) + "00";
        if (!fiatDigits) fiatDigits = "0";
      } else {
        fiatDigits = (fiatDigits === "0" ? "" : fiatDigits) + value;
      }
      html = formatFiatFromDigits(fiatDigits, decimalChar);
    } else {
      if (value === arrow) {
        html = html.length > 1 ? html.slice(0, -1) : "0";
      } else if (value === "00") {
        // If current is "0", keep it "0"; otherwise append two zeros
        html = html === "0" ? "0" : html + "00";
      } else {
        // If current is "0", replace with the digit; else append
        html = html === "0" ? value : html + value;
      }
      // normalize away any accidental leading zeros
      html = normalizeSats(html);
      element && (element.innerHTML = html);
    }
    input(null, true);
  };

  const select = (e) => {
    const range = document.createRange();
    range.selectNodeContents(e.target);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const blur = () => {
    if (!html) html = fiat ? formatFiatFromDigits("0", decimalChar) : "0";
  };

  const keydown = (e) =>
    e.key === "Enter" && (e.preventDefault() || submit?.click?.());

  // CHANGED: make swap set html for the new mode immediately and keep DOM in sync
  const swap = () => {
    if (fiat) {
      // going -> sats
      fiat = false;
      html = normalizeSats((amount || 0).toString());
      element && (element.innerHTML = html);
    } else {
      // going -> fiat
      const cents = Math.round((parseFloat(amountFiat || "0") || 0) * 100);
      fiatDigits = Math.max(0, cents).toString();
      fiat = true;
      html = formatFiatFromDigits(fiatDigits, decimalChar);
      element && (element.innerHTML = html);
    }
    updateByMode();
    prevHtml = html.toString();

    // Move caret to end after swap
    queueMicrotask(() => {
      const node = element?.childNodes?.[0];
      if (!node) return;
      const range = document.createRange();
      const sel = getSelection();
      const L = node.length ?? node.textContent?.length ?? 0;
      range.setStart(node, L);
      range.setEnd(node, L);
      sel.removeAllRanges();
      sel.addRange(range);
    });

    $fiatStore = fiat;
  };

  const arrow = "<";
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
    "00",
    "0",
    arrow,
  ];

  onMount(() => {
    fiat = $fiatStore;
    if (fiat) {
      const cents = Math.round((parseFloat(amountFiat || "0") || 0) * 100);
      fiatDigits = Math.max(0, cents).toString();
      html = formatFiatFromDigits(fiatDigits, decimalChar); // keep html in sync on mount
    } else {
      html = normalizeSats((amount || 0).toString());
    }
    element && (element.innerHTML = html);
    updateByMode();
  });
</script>

<div class="flex justify-center items-center">
  <div class="space-y-5 w-full">
    <div class="text-center">
      <div
        class="text-5xl md:text-6xl font-semibold tracking-widest flex justify-center"
      >
        <div class="my-auto" class:text-5xl={!fiat}>
          {#if fiat}
            {#if position === "before"}{symbol}{/if}
          {:else}
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
            ></iconify-icon>
          {/if}
        </div>

        <!-- contenteditable input -->
        <div
          use:focus
          role="textbox"
          tabindex="0"
          aria-label="Amount input"
          aria-multiline="false"
          contenteditable
          bind:innerHTML={html}
          inputmode={fiat ? "decimal" : "numeric"}
          enterkeyhint="done"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          onpaste={pasted}
          onfocus={(e) => {
            select(e);
          }}
          onblur={blur}
          oninput={input}
          onkeydown={keydown}
          class="outline-none my-auto"
          bind:this={element}
        ></div>

        {#if fiat && position === "after"}{symbol}{/if}
      </div>

      <!-- swap button -->
      <button
        type="button"
        class="flex items-center justify-center text-2xl cursor-pointer mx-auto select-none"
        aria-label="Swap currency display"
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          swap();
        }}
      >
        {#if fiat}
          <iconify-icon
            noobserver
            icon="ph:lightning-fill"
            class="text-yellow-300"
          ></iconify-icon>
          {s(amount, locale)}
        {:else}
          {f(amountFiat, currency, locale)}
        {/if}
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 w-full mx-auto">
      {#each numPad as value}
        {#if value === arrow}
          <button
            type="button"
            class="btn"
            aria-label="Backspace"
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleInput(value);
            }}
          >
            <Left />
          </button>
        {:else}
          <button
            type="button"
            class="btn"
            aria-label={`Key ${value}`}
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleInput(value);
            }}
          >
            {value}
          </button>
        {/if}
      {/each}
    </div>
  </div>
</div>
