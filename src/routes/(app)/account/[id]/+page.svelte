<script>
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  let name;
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Account settings</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5" method="POST">
      <div>
        <label for="display" class="font-bold mb-1 block">Account name</label>
        <input type="text" name="name" bind:value={name} />
      </div>

      <button type="submit">Save</button>
    </form>
  </div>
</div>
