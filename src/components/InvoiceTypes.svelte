<script lang="ts">
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhXBold from "virtual:icons/ph/x-bold";
  import { types } from "$lib/utils";
  import { page } from "$app/stores";
  import { amountPrompt } from "$lib/store";
  let {
    newAmount = $bindable(),
    invoice,
    user,
    hasArk = false,
    t,
    toggleType,
    setAmount,
    setType,
    activeOnly = false,
  } = $props();

  let { aid, address_type, type } = $derived(invoice);
</script>

<div class="text-xl">Bitcoin</div>
<div class="flex flex-wrap gap-2">
  <button
    class="btn flex-nowrap !w-auto grow"
    class:bg-base-300={type === types.bitcoin && address_type === "bech32"}
    class:text-secondary={type === types.bitcoin && address_type === "bech32"}
    class:hidden={activeOnly && (type !== types.bitcoin || address_type !== "bech32")}
    onclick={() => (activeOnly ? toggleType() : setType(types.bitcoin))}
  >
    <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
    <div class="my-auto text-lg">Segwit</div>
  </button>

  <button
    class="btn flex-nowrap !w-auto grow"
    class:bg-base-300={type === types.bitcoin && address_type === "bech32m"}
    class:text-secondary={type === types.bitcoin && address_type === "bech32m"}
    class:hidden={activeOnly && (type !== types.bitcoin || address_type !== "bech32m")}
    onclick={() => (activeOnly ? toggleType() : setType(types.bitcoin, "bech32m"))}
  >
    <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
    <div class="my-auto text-lg">Taproot</div>
  </button>

  <button
    class="btn flex-nowrap !w-auto grow"
    class:bg-base-300={type === types.bitcoin && address_type === "legacy"}
    class:text-secondary={type === types.bitcoin && address_type === "legacy"}
    class:hidden={activeOnly && (type !== types.bitcoin || address_type !== "legacy")}
    onclick={() => (activeOnly ? toggleType() : setType(types.bitcoin, "legacy"))}
  >
    <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
    <div class="my-auto text-lg">Legacy</div>
  </button>
</div>

{#if invoice.uid === aid}
  <div class="text-xl">Lightning</div>
  <div class="flex flex-wrap gap-2">
    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.lightning && $page.url.pathname.includes("/receive")}
      class:text-secondary={type === types.lightning && $page.url.pathname.includes("/receive")}
      class:hidden={activeOnly &&
      (type !== types.lightning || !$page.url.pathname.includes("/receive"))}
      onclick={() => {
        if (activeOnly) toggleType();
        else {
          $amountPrompt = false;
          newAmount = undefined;
          setType(types.lightning);
        }
      }}
    >
      <div class="bg-black rounded-full w-8 h-8 items-center justify-center flex">
        <div class="m-auto mt-1">
          <PhLightningFill width="24" class="text-yellow-300" />
        </div>
      </div>
      <div class="my-auto text-lg">LNURL</div>
    </button>
    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.bolt12}
      class:text-secondary={type === types.bolt12}
      class:hidden={activeOnly && type !== types.bolt12}
      onclick={() => (activeOnly ? toggleType() : setType(types.bolt12))}
    >
      <div class="bg-black rounded-full w-8 h-8 items-center justify-center flex">
        <div class="m-auto mt-1">
          <PhLightningFill width="24" class="text-yellow-300" />
        </div>
      </div>
      <div class="my-auto text-lg">Bolt 12</div>
    </button>

    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.lightning && !$page.url.pathname.includes("/receive")}
      class:text-secondary={type === types.lightning && !$page.url.pathname.includes("/receive")}
      class:hidden={activeOnly &&
      (type !== types.lightning || $page.url.pathname.includes("/receive"))}
      onclick={() => {
        if (activeOnly) toggleType();
        else {
          $amountPrompt = false;
          newAmount = 0;
          setType(types.lightning);
        }
      }}
    >
      <div class="bg-black rounded-full w-8 h-8 items-center justify-center flex">
        <div class="m-auto mt-1">
          <PhLightningFill width="24" class="text-yellow-300" />
        </div>
      </div>
      <div class="my-auto text-lg">Bolt 11</div>
    </button>
  </div>

  <div class="text-xl">{t("payments.other")}</div>
  <div class="flex flex-wrap gap-2">
    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.ecash}
      class:text-secondary={type === types.ecash}
      class:hidden={activeOnly && type !== types.ecash}
      onclick={() => (activeOnly ? toggleType() : setType(types.ecash))}
    >
      <img src="/images/cash.png" class="w-8 my-auto" alt="Ecash" />
      <div class="my-auto text-lg">Ecash</div>
    </button>

    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.liquid}
      class:text-secondary={type === types.liquid}
      class:hidden={activeOnly && type !== types.liquid}
      onclick={() => (activeOnly ? toggleType() : setType(types.liquid))}
    >
      <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
      <div class="my-auto text-lg">Liquid</div>
    </button>

    {#if hasArk}
      <button
        class="btn flex-nowrap !w-auto grow"
        class:bg-base-300={type === types.ark}
        class:text-secondary={type === types.ark}
        class:hidden={activeOnly && type !== types.ark}
        onclick={() => (activeOnly ? toggleType() : setType("ark"))}
      >
        <img src="/images/ark.png" class="w-8 rounded-full bg-neutral" alt="Ark" />
        <div class="my-auto text-lg">Ark</div>
      </button>
    {/if}
  </div>

  <div></div>
  <button type="button" class="btn" onclick={toggleType}>
    <PhXBold width="32" />
    <div class="my-auto">{t("payments.cancel")}</div>
  </button>
{/if}
