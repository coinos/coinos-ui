<script>
  import { amountPrompt } from "$lib/store";
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";

  let {
    currency = $bindable(),
    fiat = $bindable(),
    locale = $bindable(),
    rate = $bindable(),
    submit = $bindable(),
    settingAmount,
    setAmount,
    newAmount = $bindable(),
    toggleAmount,
    t,
  } = $props();
</script>

{#if settingAmount}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto p-12 max-w-xl shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <form onsubmit={setAmount} class="space-y-5">
        <Numpad
          bind:amount={newAmount}
          bind:fiat
          {currency}
          {rate}
          {submit}
          {locale}
        />
        <div class="w-full flex flex-wrap gap-2">
          <button
            bind:this={submit}
            type="submit"
            onclick={setAmount}
            class="btn btn-accent"
          >
            <div class="my-auto">{t("payments.ok")}</div>
          </button>
          <button
            type="button"
            class="btn"
            onclick={toggleAmount}
            onkeydown={toggleAmount}
          >
            <div class="my-auto">{t("payments.cancel")}</div>
          </button>
        </div>
      </form>

      <div class="flex justify-center gap-3">
        <div class="text-secondary">{t("payments.amountPrompt")}</div>
        <Toggle id="notify" bind:value={$amountPrompt} />
      </div>
    </div>
  </div>
{/if}
