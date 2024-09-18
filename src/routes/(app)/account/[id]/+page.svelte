<script>
  import { goto } from "$app/navigation";
  import { fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";

  export let data;
  let { account, user } = data;
  let { id, name } = account;

  let del = async () => {
    try {
      await post("/api/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e) {
      fail(e.message);
    }
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Account settings</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST">
      <div>
        <label for="display" class="font-bold mb-1 block">Account name</label>
        <input use:focus type="text" name="name" bind:value={name} />
      </div>

      <div class="space-y-2">
        <button
          type="submit"
          class="rounded-2xl border py-3 font-bold mx-auto bg-black text-white px-4 w-full"
          >Submit</button
        >
        <button
          on:click={del}
          type="button"
          class="flex gap-2 rounded-2xl border py-3 font-bold mx-auto px-4 w-full justify-center border-red-600 border-2"
        >
          <Icon icon="trash" style="w-8 my-auto" />
          <div class="my-auto">Delete</div></button
        >
      </div>
    </form>
  </div>
</div>
