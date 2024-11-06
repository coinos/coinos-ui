<script>
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";

  export let currency,
    rate,
    fiat,
    submit,
    settingAmount,
    setAmount,
    newAmount,
    toggleAmount,
    t,
    amountPrompt;
</script>

{#if settingAmount}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto p-12 max-w-xl shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <form on:submit|preventDefault={setAmount} class="space-y-5">
        <Numpad
          bind:amount={newAmount}
          bind:currency
          bind:rate
          bind:fiat
          bind:submit
        />
        <div class="w-full flex flex-wrap gap-2">
          <button
            bind:this={submit}
            type="submit"
            on:click|preventDefault|stopPropagation={setAmount}
            class="btn btn-accent"
          >
            <div class="my-auto">{t("payments.ok")}</div>
          </button>
          <button
            type="button"
            class="btn"
            on:click|preventDefault|stopPropagation={toggleAmount}
            on:keydown|preventDefault|stopPropagation={toggleAmount}
          >
            <div class="my-auto">{t("payments.cancel")}</div>
          </button>
        </div>
      </form>

      <div class="flex justify-center gap-3">
        <div class="text-secondary">{t("payments.amountPrompt")}</div>
        <Toggle id="notify" bind:value={amountPrompt} />
      </div>
    </div>
  </div>
{/if}
