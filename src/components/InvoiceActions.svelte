<script>
  let {
    user,
    invoice,
    copy,
    t,
    link,
    type,
    types,
    showQr = $bindable(),
    txt,
    toggleAmount
  } = $props();
</script>

<div class="text-secondary space-y-2 text-xl pt-2">
  <button type="button" class="btn" onclick={() => copy(txt)}>
    <iconify-icon icon="ph:copy-bold" width="32"></iconify-icon>
    <div class="my-auto">
      {t("payments.copy")}
    </div>
  </button>

  {#if user?.id === invoice?.user?.id}
    <button class="btn" onclick={toggleAmount}>
      <iconify-icon icon="ph:pencil-simple-bold" width="32"></iconify-icon>
      <div class="my-auto">{t("payments.setAmount")}</div>
    </button>
  {:else}
    <a href={link} class="block">
      <button class="btn">
        <iconify-icon icon="ph:wallet-bold" width="32"></iconify-icon>
        <div class="my-auto">{t("payments.openLink")}</div>
      </button>
    </a>
  {/if}

  {#if txt.length > 120}
    <div class="w-full flex justify-center gap-2 flex-wrap">
      <button class="btn" onclick={() => (showQr = !showQr)}>
        {#if showQr}
          <iconify-icon icon="ph:text-align-center-bold" width="32"></iconify-icon>
        {:else}
          <iconify-icon icon="ph:qr-code-bold" width="32"></iconify-icon>
        {/if}
        <div class="my-auto">
          {showQr ? t("payments.showText") : t("payments.showQr")}
        </div></button
      >
    </div>
  {/if}
</div>
