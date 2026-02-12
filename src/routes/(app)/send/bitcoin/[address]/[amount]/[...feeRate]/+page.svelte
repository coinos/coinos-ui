<script lang="ts">
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Toggle from "$comp/Toggle.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import WalletPass from "$comp/WalletPass.svelte";
  import { page } from "$app/stores";
  import { toFiat, f, focus, s, sat, closest, network } from "$lib/utils";
  import { pin } from "$lib/store";
  import { goto, invalidate } from "$app/navigation";
  import { rate } from "$lib/store";
  import { applyAction } from "$app/forms";
  import { hex as hexUtil } from "@scure/base";
  import * as btc from "@scure/btc-signer";
  import { decrypt } from "nostr-tools/nip49";
  import { getRememberedWalletPassword, forgetWalletPassword } from "$lib/passwordCache";
  import { sendArkViaForward } from "$lib/ark";

  import Amount from "$comp/Amount.svelte";

  let { data, form }: any = $props();

  let { encode, decode } = hexUtil;
  let passwordPrompt = $state();
  let password: any = $state();
  let cancel = $state(() => (passwordPrompt = false));
  let signed = $state();
  let loading = $state(false);
  let error = $state("");

  let trySignWithCachedPassword = async () => {
    const cached = getRememberedWalletPassword();
    if (!cached) return false;
    try {
      password = cached;
      await signTx();
      return true;
    } catch (e: any) {
      forgetWalletPassword();
      return false;
    }
  };

  let togglePassword = async () => {
    if (passwordPrompt) {
      passwordPrompt = false;
      return;
    }
    if (await trySignWithCachedPassword()) return;
    passwordPrompt = true;
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
          error = e.message || "Failed to send";
        }
      })();

      return;
    }

    if ((account.seed || data.user.seed) && !signed) (cancel(), void togglePassword());
    return async ({ result }) => {
      if (result.type === "redirect") {
        goto(result.location);
      } else {
        await applyAction(result);
        invalidate("app:payments");
      }
    };
  };

  let signTx = async () => {
    const { decrypt } = await import("nostr-tools/nip49");
    const [{ Transaction }, { HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] =
      await Promise.all([
        import("@scure/btc-signer"),
        import("@scure/bip32"),
        import("@scure/bip39"),
        import("@scure/bip39/wordlists/english.js"),
      ]);
    let entropy = await decrypt(account.seed || data.user.seed, password as string);
    let mnemonic = entropyToMnemonic(entropy, wordlist);
    let seed = await mnemonicToSeed(mnemonic, password as string);
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

  let { account, amount, address, message, fee, fees, subtract, ourfee, hex, inputs } =
    $derived(data);

  let { feeRate }: any = $state(data);

  $effect(() => {
    if (fees) {
      delete fees.minimumFee;
      feeRate = feeRate ? closest(Object.values(fees), feeRate) : fees.halfHourFee;
    }
  });

  $effect(() => {
    if (!$rate) $rate = data.rate;
  });

  let { balance, currency } = data.user;
  let submitting = $state(),
    submit: any = $state(),
    showSettings = $state();

  let feeNames = {
    fastestFee: $t("payments.fastest"),
    halfHourFee: $t("payments.fast"),
    hourFee: $t("payments.medium"),
  };

  let toggleSettings = () => (showSettings = !showSettings);

  let setFee = () => goto(`/send/bitcoin/${address}/${amount}/${feeRate}`);
  let goBack = () => goto(`/send/bitcoin/${address}`);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center no-transition">
  <h1 class="text-3xl md:text-4xl font-semibold mb-2">{$t("payments.send")}</h1>

  {#if form?.message || message || error}
    <div class="mb-5">
      <div class="text-red-600">{form?.message || message || error}</div>
    </div>
  {:else}
    <div class="text-xl text-secondary break-all">{address}</div>

    <Amount amount={subtract ? amount - fee - ourfee : amount} rate={$rate} {currency} />

    {#if fees}
      <div class="text-center">
        <h2 class="text-secondary text-lg">{$t("payments.networkFee")}</h2>

        <div class="flex flex-wrap gap-4 justify-center">
          <select bind:value={feeRate} onchange={setFee}>
            {#each Object.keys(feeNames) as feeName}
              <option value={fees[feeName]}
                >{feeNames[feeName]} &mdash; {fees[feeName]} sats/vb</option
              >
            {/each}
          </select>
          <Amount amount={fee} rate={$rate} {currency} />
        </div>
      </div>

      {#if ourfee}
        <div class="text-center">
          <h2 class="text-secondary text-lg">{$t("payments.platformFee")}</h2>

          <Amount amount={ourfee} rate={$rate} {currency} />
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

{#if passwordPrompt}
  <WalletPass bind:password {cancel} submit={signTx} />
{/if}

<style>
  .no-transition {
    view-transition-name: fee;
  }
</style>
