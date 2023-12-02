<script>
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";
</script>

<div class="flex justify-center items-center mt-20">
  <div class="space-y-5 text-center">
    <a href="/">
      <Icon icon="logo" style="mx-auto" />
    </a>

    <Icon icon="question" style="mx-auto w-56" />

    <h1 class="font-bold text-5xl">{$t("404.404")}</h1>
    <p>{$t("404.pageNotFound")}</p>
  </div>
</div>
