<script>
  let { aid, invoice, user, type, types, t, setType } = $props();
</script>

{#if invoice.uid === aid}
  <div class="grid grid-cols-2 gap-2 justify-around text-secondary">
    <button
      class="btn flex-nowrap"
      class:bg-base-300={type === types.bitcoin}
      class:text-secondary={type === types.bitcoin}
      onclick={() => setType(types.bitcoin)}
    >
      <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
      <div class="my-auto text-lg">Bitcoin</div>
    </button>

    <button
      class="btn flex-nowrap"
      class:bg-base-300={type === types.liquid}
      class:text-secondary={type === types.liquid}
      onclick={() => setType(types.liquid)}
    >
      <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
      <div class="my-auto text-lg">Liquid</div>
    </button>

    <button
      class="btn flex-nowrap"
      class:bg-base-300={type === types.lightning}
      class:text-secondary={type === types.lightning}
      onclick={() => setType(types.lightning)}
    >
      <div class="bg-base-100 rounded-full w-8 h-8 text-center flex">
        <div class="m-auto">
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
        </div>
      </div>
      <div class="my-auto text-lg">Lightning</div>
    </button>

    <a href={`/receive`} class="block contents">
      <button class="btn flex-nowrap">
        <img src="/images/cash.png" class="w-8 my-auto" />
        <div class="my-auto text-lg">Ecash</div>
      </button>
    </a>
  </div>

  {#if type === types.liquid}
    <div class="flex justify-center">
      <div class="my-auto text-xl text-center text-secondary">
        {t("payments.onlyLbtc")}
        <span class="text-teal-500 font-bold">L-BTC</span>,
        {t("payments.dontDeposit")}
      </div>
    </div>
  {/if}
{/if}
