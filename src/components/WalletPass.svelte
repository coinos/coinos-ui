<script>
  import { preventDefault } from 'svelte/legacy';

  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  let { cancel, password = $bindable(), submit } = $props();
  let revealPassword = $state();
</script>

<div
  class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-20"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5"
  >
    <h1 class="text-center text-2xl font-semibold">
      {$t("payments.enterWalletPass")}
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
          class="absolute right-5 top-1/2"
        >
          <Icon icon={revealPassword ? "eye" : "eye-off"} />
        </button>
      </div>
      <div class="w-full flex justify-center gap-2">
        <button
          type="button"
          class="border rounded-2xl font-semibold mx-auto py-5 px-6 hover:opacity-80 mx-auto grow"
          onclick={cancel}
          onkeydown={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
        <button
          type="submit"
          class="border rounded-2xl font-semibold mx-auto py-5 px-6 hover:opacity-80 mx-auto grow"
        >
          <div class="my-auto">Submit</div>
        </button>
      </div>
    </form>
  </div>
</div>
