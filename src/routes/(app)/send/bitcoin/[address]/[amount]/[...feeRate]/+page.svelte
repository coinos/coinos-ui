<script lang="ts">
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Toggle from "$comp/Toggle.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { toFiat, f, fail, focus, loc, s, sat, network, versions } from "$lib/utils";
  import { pin } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { rate } from "$lib/store";
  import { applyAction } from "$app/forms";
  import { hex as hexUtil } from "@scure/base";
  import * as btc from "@scure/btc-signer";
  import { getCachedPrfKey } from "$lib/passwordCache";
  import { sendArkViaForward } from "$lib/ark";
  import { prfDecrypt, isPrfEncrypted } from "$lib/crypto";

  import Amount from "$comp/Amount.svelte";
  import Slider from "$comp/Slider.svelte";

  let { data, form }: any = $props();

  let { encode, decode } = hexUtil;
  let signed = $state();
  let loading = $state(false);
  let error = $state("");

  let trySign = async () => {
    const prfKey = getCachedPrfKey();
    if (prfKey) {
      try {
        await signTxWithPrf(prfKey);
        return;
      } catch (e: any) {
        console.log("Signing with cached PRF key failed:", e.message);
      }
    }
    const { getWalletEntropy, deriveNostrEntropy } = await import("$lib/walletEntropy");
    const entropy = await getWalletEntropy();
    if (entropy) {
      try {
        await signTxWithPrf(entropy);
        return;
      } catch (e: any) {
        console.log("Signing with wallet entropy failed:", e.message);
      }
    }
    try {
      const interactiveEntropy = await deriveNostrEntropy();
      await signTxWithPrf(interactiveEntropy);
    } catch (e: any) {
      console.log("Signing with interactive entropy failed:", e.message);
      error = e.message || $t("payments.failedToSend");
    }
  };

  let handler = ({ cancel }) => {
    if (account.type === "ark") {
      cancel();

      (async () => {
        loading = true;
        error = "";
        try {
          const p = await sendArkViaForward({
            serverArkAddress: data.serverArkAddress,
            amount: parseInt(amount),
            aid: account.id,
            forward: address,
            user: data.user,
          });
          goto(`/sent/${p.id}`, { invalidateAll: true });
        } catch (e: any) {
          loading = false;
          error = e.message || $t("payments.failedToSend");
        }
      })();

      return;
    }

    if ((account.seed || account.fingerprint) && !signed) (cancel(), void trySign());
    return async ({ result }) => {
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
        invalidate("app:payments");
      }
    };
  };

  let signTxWithPrf = async (prfKey: ArrayBuffer) => {
    const [{ Transaction }, { HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] =
      await Promise.all([
        import("@scure/btc-signer"),
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);
    let mnemonicStr: string;
    if (account.seed && isPrfEncrypted(account.seed)) {
      const entropy = await prfDecrypt(prfKey, account.seed);
      mnemonicStr = entropyToMnemonic(entropy, wordlist);
    } else {
      const entropy = new Uint8Array(prfKey).slice(0, 16);
      mnemonicStr = entropyToMnemonic(entropy, wordlist);
    }
    let seed = await mnemonicToSeed(mnemonicStr);
    let master = HDKey.fromMasterSeed(seed, versions as any);
    let child = master.derive(`m/84'/0'/${account.accountIndex ?? 0}'`);

    if (account.pubkey && child.publicExtendedKey !== account.pubkey) {
      throw new Error("Derived key does not match account — try logging in again");
    }

    let raw = decode(hex);
    let isPSBT = raw[0] === 0x70 && raw[1] === 0x73 && raw[2] === 0x62 && raw[3] === 0x74;
    let tx: any = isPSBT ? Transaction.fromPSBT(raw) : Transaction.fromRaw(raw);

    for (let [i, input] of tx.inputs.entries()) {
      let { witnessUtxo, path } = inputs[i];
      if (!isPSBT) {
        witnessUtxo.amount = BigInt(witnessUtxo.amount);
        witnessUtxo.script = decode(witnessUtxo.script);
        tx.updateInput(i, { witnessUtxo });
      }
      let key = child.derive(path);
      tx.signIdx(key.privateKey!, i);
    }

    tx.finalize();
    hex = tx.hex;
    signed = true;
    await tick();
    (submit as any).click();
  };

  let toggle = () => (submitting = !submitting);

  let { account, amount, address, message, fee, fees, subtract, ourfee, hex, inputs, forward, bumpReserve } =
    $derived(data);

  let feeRate: any = $state((() => {
    if (data.feeRate) return data.feeRate;
    if (data.fees) return data.fees.halfHourFee;
    return 1;
  })());

  $effect(() => {
    if (fees) {
      delete fees.minimumFee;
      feeLoading = false;
    }
  });

  $effect(() => {
    if (!$rate) $rate = data.rate;
  });

  let balance = $derived(data.user.balance);
  let currency = $derived(data.user.currency);
  let locale = $derived(loc(data.user));
  let submitting = $state(),
    submit: any = $state(),
    showSettings = $state();

  let lowRate = $derived(fees ? 0.1 : 0.1);
  let midRate = $derived(fees ? fees.hourFee : 1);
  let highRate = $derived(fees ? Math.max(fees.fastestFee, 4) : 10);
  let maxRate = $derived(highRate);

  let sliderValue = $state(50);

  // Map slider (0-100) to fee rate: 0=low, 50=mid, 100=max
  let sliderToRate = (v: number) => {
    if (v <= 50) return lowRate + (midRate - lowRate) * (v / 50);
    return midRate + (maxRate - midRate) * ((v - 50) / 50);
  };

  let rateToSlider = (r: number) => {
    if (r <= midRate) return Math.round(((r - lowRate) / (midRate - lowRate)) * 50);
    return Math.round(50 + ((r - midRate) / (maxRate - midRate)) * 50);
  };

  // Init slider from feeRate
  $effect(() => {
    if (fees) {
      delete fees.minimumFee;
      sliderValue = rateToSlider(feeRate);
    }
  });

  let setFee = () => goto(`/send/bitcoin/${address}/${amount}/${feeRate}`);

  let slideTimer: ReturnType<typeof setTimeout> | undefined;
  let feeLoading = $state(false);
  let handleSlide = () => {
    const r = Math.round(sliderToRate(sliderValue) * 10) / 10;
    feeRate = Math.max(0.1, r);
    feeLoading = true;
    clearTimeout(slideTimer);
    slideTimer = setTimeout(setFee, 500);
  };

  let midSlider = $derived(rateToSlider(midRate));
  let highSlider = $derived(rateToSlider(highRate));
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center no-transition">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  {#if form?.message || message || error}
    <div class="mb-5">
      <div class="text-red-600">{form?.message || message || error}</div>
    </div>
  {:else}
    {#if forward}
      <div class="text-xl">
        <span class="text-secondary">{$t("payments.to")}</span>
        <span class="font-semibold">{forward.alias}</span>
      </div>
    {:else}
      <div class="text-xl text-secondary break-all">{address}</div>
    {/if}

    <Amount amount={subtract ? amount - fee - ourfee : amount} rate={$rate} {currency} {locale} />

    {#if fees}
      <div class="text-center space-y-2">
        {#if !subtract}
          <h2 class="text-secondary text-lg">{$t("payments.networkFee")}</h2>

          <div class="px-2">
            <div class="relative">
              <Slider bind:value={sliderValue} handle={handleSlide} min={0} max={100} />
              <div class="absolute inset-0 pointer-events-none">
                <span
                  class="absolute top-1/2 -translate-y-1/2 text-sm font-semibold whitespace-nowrap {sliderValue >= 50 ? 'text-white dark:text-black' : 'text-black dark:text-white'}"
                  style={sliderValue >= 50
                    ? `right: calc(${100 - sliderValue}% + 28px); text-align: right`
                    : `left: calc(${sliderValue}% + 28px); text-align: left`}
                >{feeRate} sat/vB</span>
              </div>
            </div>
            <div class="flex justify-between text-secondary mt-1 px-1">
              <span>{$t("payments.slow")}</span>
              <span>{$t("payments.fast")}</span>
            </div>
          </div>
        {/if}

        {#if feeLoading}
          <Spinner class="text-secondary" />
        {:else}
          <div class="flex justify-center gap-6">
            <div class="text-center">
              <Amount amount={fee} rate={$rate} {currency} {locale} />
              <div class="text-sm text-secondary -mt-1">Paid now</div>
            </div>

            {#if bumpReserve > 0}
              <div class="text-center">
                <Amount amount={bumpReserve} rate={$rate} {currency} {locale} />
                <div class="text-sm text-secondary -mt-1">Refundable reserve</div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      {#if ourfee}
        <div class="text-center">
          <h2 class="text-secondary text-lg">{$t("payments.platformFee")}</h2>

          <Amount amount={ourfee} rate={$rate} {currency} {locale} />
        </div>
      {/if}
    {/if}

    <form method="POST" use:enhance={handler}>
      <input name="pin" value={$pin} type="hidden" />
      <input name="address" value={address} type="hidden" />
      <input name="hex" value={hex} type="hidden" />
      <input name="rate" value={$rate} type="hidden" />
      <input name="aid" value={account.id} type="hidden" />
      <input name="signed" value={signed} type="hidden" />
      <input name="feeRate" value={feeRate} type="hidden" />
      <input name="bumpReserve" value={bumpReserve} type="hidden" />
      <input name="parentVsize" value={data.parentVsize || 0} type="hidden" />

      <div class="flex justify-center gap-2">
        <button
          use:focus
          bind:this={submit}
          type="submit"
          class="btn btn-accent"
          disabled={submitting || loading}
        >
          {#if submitting || loading}
            <Spinner />
          {:else}
            {$t("payments.send")}
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .no-transition {
    view-transition-name: fee;
  }
</style>
