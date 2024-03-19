<script>
  import Icon from "$comp/Icon.svelte";
  import { focus, fail, post } from "$lib/utils";
  import { password as pw, passwordPrompt } from "$lib/store";

  export let user;

  let password;
  let { username } = user;
  let revealPassword = false;

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
  class="fixed inset-0 bg-gray-600 dark:bg-stone-950 dark:bg-opacity-90 bg-opacity-50 overflow-y-auto h-full w-full z-20"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-stone-800 dark:border-0 space-y-5"
  >
    <h1 class="text-center text-2xl font-semibold">
      Please enter your password
    </h1>
    <form on:submit|preventDefault={submit}>
      <div class="relative mb-5">
        {#if revealPassword}
          <input
            name="password"
            type="text"
            required
            class="bg-primary dark:bg-stone-700 dark:border-gray-50"
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {:else}
          <input
            name="password"
            type="password"
            required
            class="bg-primary dark:bg-stone-700 dark:border-gray-50"
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {/if}
        <button
          type="button"
          on:click={() => (revealPassword = !revealPassword)}
          class="absolute right-5 dark:invert {revealPassword ? 'top-[18px]' : 'top-[16px]'}"
        >
          <Icon icon={revealPassword ? "eye" : "eye-off"} />
        </button>
      </div>
      <div class="w-full flex">
        <button
          type="button"
          class="border-2 border-black dark:border-gray-50 dark:text-gray-50 rounded-xl font-semibold py-3 w-40 hover:opacity-80 mx-auto"
          on:click={cancel}
          on:keydown={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
        <button
          type="submit"
          class="border-2 border-black dark:border-gray-50 bg-black text-white dark:bg-gray-50 dark:text-black rounded-xl font-semibold py-3 w-40 hover:opacity-80 mx-auto"
        >
          <div class="my-auto">Submit</div>
        </button>
      </div>
    </form>
  </div>
</div>
