<script>
  import { t } from "$lib/translations";
  import ItemForm from "$comp/ItemForm.svelte";
  export let data;
  let { token } = data;
  let item = {};
</script>

<div class="container max-w-xl mx-auto">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t("items.add")}
  </h1>
  <ItemForm {item} {token} />
</div>
