<script lang="ts">
  import { run } from 'svelte/legacy';

  import { t } from "$lib/translations";
  import ItemForm from "$comp/ItemForm.svelte";
  import { fail } from "$lib/utils";

  let { data, form } = $props();

  run(() => {
    form?.message && fail(form.message);
  });
  let { item, user } = data;
</script>

<div class="container max-w-xl mx-auto px-4">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t("items.edit")}
  </h1>
  <ItemForm {item} {user} />
</div>
