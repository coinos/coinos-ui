<script>
  import { types } from "$lib/utils";
  import { goto } from "$app/navigation";
  let { aid, invoice, user, type, t, setType } = $props();
</script>

{#if invoice.uid === aid}
  <div class="grid grid-cols-2 gap-2 justify-around text-secondary">
    <button
      class="btn flex-nowrap"
      class:bg-base-300={type === types.lightning}
      class:text-secondary={type === types.lightning}
      onclick={() => setType(types.lightning)}
    >
      <div
        class="bg-black rounded-full w-8 h-8 items-center justify-center flex"
      >
        <div class="m-auto">
          <iconify-icon noobserver
            icon="ph:lightning-fill"
            class="text-yellow-300 text-2xl"
          ></iconify-icon>
        </div>
      </div>
      <div class="my-auto text-lg">Lightning</div>
    </button>

    <button
      class="btn flex-nowrap"
      class:bg-base-300={type === types.ecash}
      class:text-secondary={type === types.ecash}
      onclick={() => setType(types.ecash)}
    >
      <img src="/images/cash.png" class="w-8 my-auto" />
      <div class="my-auto text-lg">Ecash</div>
    </button>

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

    <button class="btn flex-nowrap" onclick={() => goto("/scan")}>
      <iconify-icon noobserver icon="ph:camera-bold" width="32"></iconify-icon>
      <div class="my-auto text-lg">{t("user.send.scan")}</div>
    </button>

    <button class="btn flex-nowrap" onclick={() => goto("/receive")}>
      <iconify-icon noobserver icon="ph:clipboard-text-bold" width="32"></iconify-icon>
      <div class="my-auto text-lg">{t("user.send.paste")}</div>
    </button>
  </div>

  <button
    class="btn flex-nowrap"
    class:bg-base-300={type === types.bolt12}
    class:text-secondary={type === types.bolt12}
    onclick={() => setType(types.bolt12)}
  >
    <div class="bg-black rounded-full w-8 h-8 items-center justify-center flex">
      <div class="m-auto">
        <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300 text-2xl"
        ></iconify-icon>
      </div>
    </div>
    <div class="my-auto text-lg">Bolt 12</div>
  </button>
{/if}
