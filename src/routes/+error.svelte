<script>
  import { back } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import { page } from "$app/stores";

  export let data;
  let { user } = data;

  let link = user ? `/${user.username}` : "/";
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
  <div class="w-full flex">
    <a href="/" class="mx-auto">
      <Icon icon="logo" />
    </a>
  </div>

  <div class="flex justify-center items-center">
    <div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
      <div class="relative">
        <h1 class="text-2xl md:text-3xl font-semibold text-center">Error</h1>
      </div>
      <p class="text-secondary text-center">Something went wrong</p>
      <p class="text-secondary text-center">{$page.error.message}</p>

      <div class="flex justify-center py-24">
        <a href={link}>
          <button
            class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 text-xl"
          >
            Back
          </button>
        </a>
      </div>
    </div>
  </div>
</div>
