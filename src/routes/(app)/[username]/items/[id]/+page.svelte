<script>
  import ItemForm from "$comp/ItemForm.svelte";
  export let data;
  let { item } = data;
</script>

<ItemForm {item} />
