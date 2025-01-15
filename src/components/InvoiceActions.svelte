<script>
  import { goto } from "$app/navigation";
  import InvoiceTypes from "$comp/InvoiceTypes.svelte";
  let {
    user,
    invoice,
    copy,
    t,
    link,
    type,
    showQr = $bindable(),
    txt,
    setAmount,
    newAmount = $bindable(),
    toggleType,
    toggleAmount,
    setType,
    toggleMemo,
  } = $props();
</script>

<div class="text-secondary space-y-2 text-xl pt-2">
  <InvoiceTypes
    {invoice}
    {user}
    {toggleType}
    bind:newAmount
    {setAmount}
    {setType}
    t={$t}
    activeOnly={true}
  />

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
          <iconify-icon noobserver icon="ph:wallet-bold" width="32"
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

  {#if txt.length > 120}
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
</div>
