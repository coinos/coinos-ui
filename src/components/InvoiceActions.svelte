<script>
  let {
    user,
    invoice,
    copy,
    t,
    link,
    type,
    showQr = $bindable(),
    txt,
    toggleAmount,
    toggleMemo,
  } = $props();
</script>

<div class="text-secondary space-y-2 text-xl pt-2">
  <button type="button" class="btn" onclick={() => copy(txt)}>
    <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
    <div class="my-auto">
      {t("payments.copy")}
    </div>
  </button>

  {#if user?.id === invoice?.user?.id}
    <button class="btn" onclick={toggleAmount}>
      <iconify-icon noobserver icon="ph:pencil-simple-bold" width="32"></iconify-icon>
      <div class="my-auto">{t("payments.setAmount")}</div>
    </button>
  {:else}
    <a href={link} class="block">
      <button class="btn">
        <iconify-icon noobserver icon="ph:wallet-bold" width="32"></iconify-icon>
        <div class="my-auto">{t("payments.openLink")}</div>
      </button>
    </a>
  {/if}

  <button class="btn" onclick={toggleMemo}>
    <iconify-icon noobserver icon="ph:chat-centered-text-bold" width="32"></iconify-icon>
    <div class="my-auto">
      {t("invoice.setMemo")}
    </div>
  </button>

  {#if txt.length > 120}
    <div class="w-full flex justify-center gap-2 flex-wrap">
      <button class="btn" onclick={() => (showQr = !showQr)}>
        {#if showQr}
          <iconify-icon noobserver icon="ph:text-align-center-bold" width="32"
          ></iconify-icon>
        {:else}
          <iconify-icon noobserver icon="ph:qr-code-bold" width="32"></iconify-icon>
        {/if}
        <div class="my-auto">
          {showQr ? t("payments.showText") : t("payments.showQr")}
        </div></button
      >
    </div>
  {/if}
</div>
