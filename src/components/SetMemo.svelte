<script>
  import { focus } from "$lib/utils";

  let {
    submit = $bindable(),
    settingMemo,
    setMemo,
    memo = $bindable(),
    toggleMemo,
    t,
  } = $props();
</script>

{#if settingMemo}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto p-12 max-w-xl shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <form onsubmit={setMemo} class="space-y-5">
        <input use:focus placeholder={t("invoice.memo")} bind:value={memo} />
        <div class="w-full flex flex-wrap gap-2">
          <button
            bind:this={submit}
            type="submit"
            onclick={setMemo}
            class="btn btn-accent"
          >
            <div class="my-auto">{t("payments.ok")}</div>
          </button>
          <button
            type="button"
            class="btn"
            onclick={toggleMemo}
            onkeydown={toggleMemo}
          >
            <div class="my-auto">{t("payments.cancel")}</div>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
