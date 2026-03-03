<script lang="ts">
  import PhFilePlusBold from "virtual:icons/ph/file-plus-bold";
  import PhFolderOpenBold from "virtual:icons/ph/folder-open-bold";
  import { t } from "$lib/translations";
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">{$t("accounts.accountSetup")}</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <a href="/account/seed" class="block">
      <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200">
        <figure class="w-20 flex items-center justify-center">
          <PhFilePlusBold width="64" />
        </figure>
        <div>
          <div class="text-xl">{$t("accounts.create")}</div>
          <div class="text-secondary">{$t("accounts.generateSeed")}</div>
        </div>
      </div>
    </a>
    <a href="/account/import" class="block">
      <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200">
        <figure class="w-20 flex items-center justify-center">
          <PhFolderOpenBold width="64" />
        </figure>
        <div>
          <div class="text-xl">{$t("accounts.import")}</div>
          <div class="text-secondary">{$t("accounts.importSeed")}</div>
        </div>
      </div>
    </a>
  </div>
</div>
