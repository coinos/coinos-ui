<script>
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">
    {$t("accounts.accountSetup")}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <div class="space-y-5">
      <a href="/account/seed" class="block">
        <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200">
          <figure class="w-20">
            <iconify-icon icon="ph:file-plus-bold" width="64"></iconify-icon>
          </figure>
          <div>
            <div class="text-xl">{$t("accounts.create")}</div>
            <div class="text-secondary">{$t("accounts.generateSeed")}</div>
          </div>
        </div>
      </a>
      <a href="/account/import" class="block">
        <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200">
          <figure class="w-20">
            <iconify-icon icon="ph:folder-open-bold" width="64"></iconify-icon>
          </figure>
          <div>
            <div class="text-xl">{$t("accounts.import")}</div>
            <div class="text-secondary">{$t("accounts.importSeed")}</div>
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
