<script>
  import { t } from "$lib/translations";
  import ItemForm from "$comp/ItemForm.svelte";
  import { fail } from "$lib/utils";

  export let data;
  export let form;

  $: form?.message && fail(form.message);
  let { user } = data;
  let item = {};
</script>

<div class="container max-w-xl mx-auto">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t("items.add")}
  </h1>
  <ItemForm {item} {user} />
</div>
