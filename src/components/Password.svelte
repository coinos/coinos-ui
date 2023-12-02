<script>
  import { Icon } from "$comp";
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
  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5"
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
            class="bg-primary"
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {:else}
          <input
            name="password"
            type="password"
            required
            class="bg-primary"
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {/if}
        <button
          type="button"
          on:click={() => (revealPassword = !revealPassword)}
          class="absolute right-5 top-6"
        >
          <Icon icon={revealPassword ? "eye" : "eye-off"} />
        </button>
      </div>
      <div class="w-full flex">
        <button
          type="button"
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
          on:click={cancel}
          on:keydown={cancel}
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
