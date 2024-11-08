<script>
  import { preventDefault } from 'svelte/legacy';

  import Icon from "$comp/Icon.svelte";
  import { focus, fail, post } from "$lib/utils";
  import { password as pw, passwordPrompt } from "$lib/store";

  let { user } = $props();

  let password = $state();
  let { username } = user;
  let revealPassword = $state(false);

  let cancel = () => ($passwordPrompt = false);

  let submit = async () => {
    try {
      await post("/password", { password });
      $passwordPrompt = false;
      $pw = password;
    } catch (e) {
      fail("Invalid password, try again");
    }
  };
</script>

<div
  class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-base-100 space-y-5"
  >
    <h1 class="text-center text-2xl font-semibold">
      Please enter your password
    </h1>
    <form onsubmit={preventDefault(submit)}>
      <div class="relative mb-5">
        {#if revealPassword}
          <input
            name="password"
            type="text"
            required
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {:else}
          <input
            name="password"
            type="password"
            required
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {/if}
        <button
          type="button"
          onclick={() => (revealPassword = !revealPassword)}
          class="absolute right-5 top-6"
        >
          <iconify-icon
            icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
            width="32"
></iconify-icon>
        </button>
      </div>
      <div class="w-full flex">
        <button
          type="button"
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
          onclick={cancel}
          onkeydown={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
        <button
          type="submit"
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
        >
          <div class="my-auto">Submit</div>
        </button>
      </div>
    </form>
  </div>
</div>
