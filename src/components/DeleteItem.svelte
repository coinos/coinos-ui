<script>
  import Icon from "$comp/Icon.svelte";
  import { fail, post } from "$lib/utils";
  import { invalidate } from "$app/navigation";

  export let item;

  let cancel = () => (item = null);

  let submit = async () => {
    try {
      await post("/api/items/delete", { item });
      invalidate("app:items");
      item = null;
    } catch (e) {
      fail("Failed to delete item");
    }
  };
</script>

<div
  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5"
  >
    <h1 class="text-center text-2xl font-semibold">Delete item</h1>
    <form on:submit|preventDefault={submit}>
      <div class="w-full flex">
        <button
          type="button"
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
          on:click={cancel}
          on:keydown={cancel}
        >
          <div class="my-auto">No</div>
        </button>
        <button
          type="submit"
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto bg-black text-white"
        >
          <div class="my-auto">Yes</div>
        </button>
      </div>
    </form>
  </div>
</div>
