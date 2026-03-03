<script lang="ts">
  import CoinosLogo from "virtual:icons/coinos/logo";
  import PhQuestionBold from "virtual:icons/ph/question-bold";
  import { t } from "$lib/translations";
</script>

<div class="flex justify-center items-center mt-20">
  <div class="space-y-5 text-center">
    <a href="/" aria-label="Go to homepage">
      <CoinosLogo width="224" class="mx-auto" />
    </a>

    <PhQuestionBold width="224" class="mx-auto" />

    <h1 class="font-bold text-5xl">{$t("404.404")}</h1>
    <p>{$t("404.pageNotFound")}</p>
  </div>
</div>
