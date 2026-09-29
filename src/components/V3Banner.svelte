<script>
  import { onMount } from "svelte";
  import { t } from "$lib/translations";

  const key = "v3BannerDismissed";
  let show = $state(false);

  onMount(() => {
    try {
      show = !localStorage.getItem(key);
    } catch (e) {
      show = true;
    }
  });

  let dismiss = () => {
    show = false;
    try {
      localStorage.setItem(key, "1");
    } catch (e) {}
  };
</script>

{#if show}
  <div
    class="flex items-center justify-center gap-2 bg-accent text-accent-content px-4 py-2 text-sm"
  >
    <a href="https://v3.coinos.io" class="flex-1 text-center font-semibold">
      {$t("v3Banner")}
    </a>
    <button onclick={dismiss} class="flex" aria-label={$t("dismiss")}>
      <iconify-icon noobserver icon="ph:x-bold" width="20"></iconify-icon>
    </button>
  </div>
{/if}
