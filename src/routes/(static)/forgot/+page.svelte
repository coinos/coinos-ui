<script lang="ts">
  import { focus } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Spinner from "$comp/Spinner.svelte";
  import { fly } from "svelte/transition";

  let loading;
</script>

<div class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 mb-20 space-y-5">
  <h1 class="text-2xl font-bold text-center">{$t("login.reset")}</h1>

  <div class="text-secondary">
    {$t("login.resetDesc")}
    <a href="mailto:support@coinos.io" class="font-bold">support@coinos.io</a>
  </div>
</div>
