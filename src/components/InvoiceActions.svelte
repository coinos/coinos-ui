<script>
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
    <img src="/images/cash.png" class="w-8 my-auto" />
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
        <iconify-icon noobserver icon="ph:pencil-simple-bold" width="32"
        ></iconify-icon>
        <div class="my-auto">{t("payments.setAmount")}</div>
      </button>
    {:else}
      <a href={link} class="block">
        <button class="btn grow !w-auto">
          <iconify-icon noobserver icon="ph:arrow-square-out-bold" width="32"
          ></iconify-icon>
          <div class="my-auto">{t("payments.openLink")}</div>
        </button>
      </a>
    {/if}

    <button class="btn grow !w-auto" onclick={toggleMemo}>
      <iconify-icon noobserver icon="ph:chat-centered-text-bold" width="32"
      ></iconify-icon>
      <div class="my-auto">
        {t("invoice.setMemo")}
      </div>
    </button>
  </div>

  <div class="flex flex-wrap gap-2 justify-around text-secondary w-full">
    <button type="button" class="btn !w-auto grow" onclick={() => copy(txt)}>
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto">
        {t("payments.copy")}
      </div>
    </button>

    <button class="btn grow !w-auto" onclick={() => goto("/receive")}>
      <iconify-icon noobserver icon="ph:clipboard-text-bold" width="32"
      ></iconify-icon>
      <div class="my-auto text-lg">{t("user.send.paste")}</div>
    </button>

    <button class="btn grow !w-auto" onclick={() => goto("/scan")}>
      <iconify-icon noobserver icon="ph:camera-bold" width="32"></iconify-icon>
      <div class="my-auto text-lg">{t("user.send.scan")}</div>
    </button>
  </div>

  {#if txt?.length > 120}
    <div class="w-full flex justify-center gap-2 flex-wrap">
      <button class="btn" onclick={() => (showQr = !showQr)}>
        {#if showQr}
          <iconify-icon noobserver icon="ph:text-align-center-bold" width="32"
          ></iconify-icon>
        {:else}
          <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
          ></iconify-icon>
        {/if}
        <div class="my-auto">
          {showQr ? t("payments.showText") : t("payments.showQr")}
        </div></button
      >
    </div>
  {/if}

  <div class="flex gap-2">
    {#if aid === user.id}
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
        <div
          class="bg-black rounded-full w-8 h-8 items-center justify-center flex"
        >
          <div class="m-auto">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300 text-2xl"
            ></iconify-icon>
          </div>
        </div>
        <div class="my-auto text-lg">Lightning</div>
      </button>
    {/if}

    {#if account?.type === types.ark}
      <button
        class="btn flex-nowrap !w-auto grow"
        class:bg-base-300={type === types.ark}
        class:text-secondary={type === types.ark}
        onclick={() => {
          $amountPrompt = false;
          newAmount = undefined;
          setType(types.ark);
        }}
      >
        <div
          class="bg-black rounded-full w-8 h-8 items-center justify-center flex"
        >
          <div class="m-auto">
            <img
              src="/images/ark.png"
              class="w-8 h-8 rounded-full object-cover"
              alt="Bitcoin"
            />
          </div>
        </div>
        <div class="my-auto text-lg">Ark</div>
      </button>
    {:else}
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

  {#if aid === user.id}
    <button type="button" class="btn" onclick={toggleType}>
      <img src="/images/liquid.svg" class="w-8" alt="Liquid" />
      <img src="/images/cash.png" class="w-8 my-auto" />
      <div class="my-auto">{t("payments.moreOptions")}</div>
    </button>
  {/if}
</div>
