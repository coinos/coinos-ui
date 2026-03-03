<script lang="ts">
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Toggle from "$comp/Toggle.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { toFiat, f, fail, focus, loc, s, sat, closest, network } from "$lib/utils";
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
      } catch (e: any) {}
    }
    const { getWalletEntropy, deriveNostrEntropy } = await import("$lib/walletEntropy");
    const entropy = await getWalletEntropy();
    if (entropy) {
      try {
        await signTxWithPrf(entropy);
        return;
      } catch (e: any) {}
    }
    try {
      const interactiveEntropy = await deriveNostrEntropy();
      await signTxWithPrf(interactiveEntropy);
    } catch (e: any) {
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
    let master = HDKey.fromMasterSeed(seed, network as any);
    let child = master.derive(`m/84'/0'/${account.accountIndex ?? 0}'`);

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

  let feeRate: any = $state((() => data.feeRate)());

  $effect(() => {
    if (fees) {
      delete fees.minimumFee;
      feeRate = feeRate ? closest(Object.values(fees), feeRate) : fees.halfHourFee;
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

  let customRate = $state("");
  let showCustom = $state(false);

  let presets = $derived(fees ? [
    { label: $t("payments.economy"), rate: 0.1 },
    { label: $t("payments.medium"), rate: fees.hourFee },
    { label: $t("payments.fast"), rate: fees.halfHourFee },
    { label: $t("payments.fastest"), rate: fees.fastestFee },
  ] : []);

  let toggleSettings = () => (showSettings = !showSettings);

  let setFee = () => goto(`/send/bitcoin/${address}/${amount}/${feeRate}`);
  let goBack = () => goto(`/send/bitcoin/${address}`);

  let pickRate = (r: number) => {
    feeRate = r;
    showCustom = false;
    setFee();
  };

  let applyCustom = () => {
    const r = parseFloat(customRate);
    if (r >= 0.1) {
      feeRate = r;
      setFee();
    }
  };
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
      <div class="text-center">
        <h2 class="text-secondary text-lg">{$t("payments.networkFee")}</h2>

        <div class="flex flex-wrap gap-2 justify-center mb-2">
          {#each presets as preset}
            <button
              type="button"
              class="btn btn-sm"
              class:btn-accent={feeRate == preset.rate && !showCustom}
              onclick={() => pickRate(preset.rate)}
            >
              {preset.label} ({preset.rate})
            </button>
          {/each}
          <button
            type="button"
            class="btn btn-sm"
            class:btn-accent={showCustom}
            onclick={() => { showCustom = true; customRate = String(feeRate); }}
          >
            Custom
          </button>
        </div>

        {#if showCustom}
          <div class="flex items-center justify-center gap-2 mb-2">
            <input
              type="number"
              min="0.1"
              step="0.1"
              class="input input-bordered w-24 text-center"
              bind:value={customRate}
              onblur={applyCustom}
              onkeydown={(e) => e.key === 'Enter' && applyCustom()}
            />
            <span class="text-secondary text-sm">sat/vB</span>
          </div>
        {/if}

        <Amount amount={fee} rate={$rate} {currency} {locale} />
      </div>

      {#if bumpReserve > 0}
        <div class="text-center">
          <h2 class="text-secondary text-lg">Bump Reserve</h2>
          <div class="text-sm text-secondary">Refundable on confirmation</div>
          <Amount amount={bumpReserve} rate={$rate} {currency} {locale} />
        </div>
      {/if}

      {#if ourfee}
        <div class="text-center">
          <h2 class="text-secondary text-lg">{$t("payments.platformFee")}</h2>

          <Amount amount={ourfee} rate={$rate} {currency} {locale} />
        </div>
      {/if}
    {/if}

    <form method="POST" use:enhance={handler}>
      <input name="pin" value={$pin} type="hidden" />
      <input name="hex" value={hex} type="hidden" />
      <input name="rate" value={$rate} type="hidden" />
      <input name="aid" value={account.id} type="hidden" />
      <input name="signed" value={signed} type="hidden" />

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
