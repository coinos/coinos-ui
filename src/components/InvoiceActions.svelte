<script lang="ts">
  import PhPencilSimpleBold from "virtual:icons/ph/pencil-simple-bold";
  import PhArrowSquareOutBold from "virtual:icons/ph/arrow-square-out-bold";
  import PhChatCenteredTextBold from "virtual:icons/ph/chat-centered-text-bold";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import { amountPrompt } from "$lib/store";
  import { types } from "$lib/utils";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  let {
    user,
    invoice,
    copy,
    t,
    link,
    showQr = $bindable(),
    txt,
    setAmount,
    newAmount = $bindable(),
    toggleType,
    toggleAmount,
    setType,
    toggleMemo,
  } = $props();

  let { aid, account, address_type, type } = $derived(invoice);
</script>

<div class="text-secondary space-y-2 text-xl pt-2">
  <button
    class="btn flex-nowrap"
    class:bg-base-300={type === types.ecash}
    class:text-secondary={type === types.ecash}
    class:hidden={type !== types.ecash}
    onclick={setType(types.ecash)}
  >
    <img src="/images/cash.png" class="w-8 my-auto" alt="Ecash" />
    <div class="my-auto text-lg">Ecash</div>
  </button>

  <button
    class="btn flex-nowrap"
    class:bg-base-300={type === types.liquid}
    class:text-secondary={type === types.liquid}
    class:hidden={type !== types.liquid}
    onclick={() => setType(types.liquid)}
  >
    <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
    <div class="my-auto text-lg">Liquid</div>
  </button>

  <div class="flex flex-wrap gap-2 justify-around text-secondary w-full">
    {#if user?.id === invoice?.user?.id}
      <button class="btn grow !w-auto" onclick={toggleAmount}>
        <PhPencilSimpleBold width="32" />
        <div class="my-auto">{t("payments.setAmount")}</div>
      </button>
    {:else}
      <a href={link} class="contents">
        <button class="btn grow !w-auto">
          <PhArrowSquareOutBold width="32" />
          <div class="my-auto">{t("payments.openLink")}</div>
        </button>
      </a>
    {/if}

    <button class="btn grow !w-auto" onclick={toggleMemo}>
      <PhChatCenteredTextBold width="32" />
      <div class="my-auto">{t("invoice.setMemo")}</div>
    </button>
  </div>



  <div class="flex gap-2">
    <button
      class="btn flex-nowrap !w-auto grow"
      class:bg-base-300={type === types.lightning}
      class:text-secondary={type === types.lightning}
      onclick={() => {
        $amountPrompt = false;
        newAmount = undefined;
        setType(types.lightning);
      }}
    >
      <div class="bg-black rounded-full w-8 h-8 items-center justify-center flex">
        <div class="m-auto">
          <PhLightningFill width="24" class="text-yellow-300" />
        </div>
      </div>
      <div class="my-auto text-lg">Lightning</div>
    </button>

    {#if !account?.seed && !(account?.pubkey && account?.fingerprint) && account?.type !== "ark"}
      <button
        class="btn flex-nowrap !w-auto grow"
        class:bg-base-300={type === types.bitcoin}
        class:text-secondary={type === types.bitcoin}
        onclick={() => setType(types.bitcoin)}
      >
        <img src="/images/bitcoin.svg" class="w-8" alt="Bitcoin" />
        <div class="my-auto text-lg">Bitcoin</div>
      </button>
    {/if}
  </div>

  <button type="button" class="btn" onclick={toggleType}>
    <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
    <img src="/images/cash.png" class="w-8 my-auto" alt="Ecash" />
    <div class="my-auto">{t("payments.moreOptions")}</div>
  </button>
</div>
