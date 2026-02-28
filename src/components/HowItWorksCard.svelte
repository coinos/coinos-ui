<script>
  import { t } from "$lib/translations";
  let { image, stepID } = $props();
</script>

<div class="space-y-5">
  <div class="h-32 flex items-center justify-center">
    <iconify-icon noobserver icon={image} class="mx-auto" width="128"></iconify-icon>
  </div>
  <p class="text-2xl font-medium">{$t("howItWorks." + stepID + ".header")}</p>
  <p class="text-secondary text-xl font-medium w-full md:w-2/3 mx-auto">
    {$t("howItWorks." + stepID + ".description")}
  </p>
</div>
