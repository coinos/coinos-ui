<script>
  import { t } from "$lib/translations";
  import AppForm from "$comp/AppForm.svelte";

  let { data, form } = $props();
  let { app, rate, user } = $derived(data);
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h2 class="text-2xl font-bold mb-2">{$t("accounts.connection")}</h2>

  {#if form?.error}
    <div class="text-red-600 text-center">
      {form.error}
    </div>
  {/if}

  <AppForm {...app} {rate} {user} />
</div>
