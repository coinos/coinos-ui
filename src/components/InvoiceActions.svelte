<script>
  export let user,
    invoice,
    copy,
    t,
    link,
    type,
    types,
    showQr,
    txt,
    toggleAmount;
</script>

<div class="text-secondary space-y-2 text-xl pt-2">
  <button type="button" class="btn" on:click={() => copy(txt)}>
    <iconify-icon icon="ph:copy-bold" width="32" />
    <div class="my-auto">
      {t("payments.copy")}
    </div>
  </button>

  {#if user?.id === invoice?.user?.id}
    <button class="btn" on:click={toggleAmount}>
      <iconify-icon icon="ph:pencil-simple-bold" width="32" />
      <div class="my-auto">{t("payments.setAmount")}</div>
    </button>
  {:else}
    <a href={link} class="w-full">
      <button class="btn">
        <iconify-icon icon="ph:wallet-bold" width="32" />
        <div class="my-auto">{t("payments.openLink")}</div>
      </button>
    </a>
  {/if}

  {#if txt.startsWith("ln")}
    <div class="w-full flex justify-center gap-2 flex-wrap">
      <button class="btn" on:click={() => (showQr = !showQr)}>
        {#if showQr}
          <iconify-icon icon="ph:text-align-center-bold" width="32" />
        {:else}
          <iconify-icon icon="ph:qr-code-bold" width="32" />
        {/if}
        <div class="my-auto">
          {showQr ? t("payments.showText") : t("payments.showQr")}
        </div></button
      >
    </div>
  {/if}
</div>
