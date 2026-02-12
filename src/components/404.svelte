<script lang="ts">
  import { t } from "$lib/translations";
</script>

<div class="flex justify-center items-center mt-20">
  <div class="space-y-5 text-center">
    <a href="/" aria-label="Go to homepage">
      <iconify-icon noobserver icon="coinos:logo" width="224" class="mx-auto"></iconify-icon>
    </a>

    <iconify-icon noobserver icon="ph:question-bold" class="mx-auto w-56"></iconify-icon>

    <h1 class="font-bold text-5xl">{$t("404.404")}</h1>
    <p>{$t("404.pageNotFound")}</p>
  </div>
</div>
