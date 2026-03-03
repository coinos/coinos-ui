<script lang="ts">
  import PhArrowLeftBold from "virtual:icons/ph/arrow-left-bold";
  import { t } from "$lib/translations";
</script>

<div class="max-w-2xl mx-auto py-10 mb-20">
  <h1 class="text-3xl font-bold mb-2">{$t("mapAdd.header")}</h1>
  <p class="text-secondary text-lg mb-8">
    {$t("mapAdd.description")}
  </p>

  <div class="space-y-8">
    <div class="flex gap-4">
      <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
      <div>
        <h2 class="text-xl font-semibold mb-1">{$t("mapAdd.step1.header")}</h2>
        <p class="text-secondary">
          {$t("mapAdd.step1.before")} <a href="https://www.openstreetmap.org" target="_blank" rel="noopener" class="text-base-content underline">
            {$t("mapAdd.step1.linkText")}</a> {$t("mapAdd.step1.after")}
        </p>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
      <div>
        <h2 class="text-xl font-semibold mb-1">{$t("mapAdd.step2.header")}</h2>
        <p class="text-secondary">
          {$t("mapAdd.step2.before")} <strong>{$t("mapAdd.step2.edit")}</strong>, {$t("mapAdd.step2.middle")} <strong>{$t("mapAdd.step2.point")}</strong> {$t("mapAdd.step2.after")}
        </p>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
      <div>
        <h2 class="text-xl font-semibold mb-1">{$t("mapAdd.step3.header")}</h2>
        <p class="text-secondary mb-3">
          {$t("mapAdd.step3.description")}
        </p>
        <div class="bg-neutral text-white rounded-lg p-4 font-mono text-sm space-y-2">
          <div><span class="font-bold">currency:XBT</span> = <span class="font-bold">yes</span></div>
          <div><span class="font-bold">payment:coinos</span> = <span class="font-bold">yes</span></div>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">4</div>
      <div>
        <h2 class="text-xl font-semibold mb-1">{$t("mapAdd.step4.header")}</h2>
        <p class="text-secondary">
          {$t("mapAdd.step4.before")} <strong>{$t("mapAdd.step4.save")}</strong> {$t("mapAdd.step4.after")}
        </p>
      </div>
    </div>
  </div>

  <div class="mt-10 flex justify-center">
    <a href="/map" class="btn btn-primary !w-auto !rounded-full px-8">
      <PhArrowLeftBold width="20" />
      {$t("mapAdd.backToMap")}
    </a>
  </div>
</div>
