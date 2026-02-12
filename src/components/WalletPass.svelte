<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import {
    rememberForOptions,
    defaultRememberForMs,
    rememberWalletPassword,
    forgetWalletPassword,
  } from "$lib/passwordCache";
  let { cancel = $bindable(), password = $bindable(), submit } = $props();
  let revealPassword = $state();
  let rememberForMs = $state(defaultRememberForMs);

  let handleSubmit = async () => {
    if (rememberForMs) {
      rememberWalletPassword(password, rememberForMs);
    } else {
      forgetWalletPassword();
    }
    await submit();
  };
</script>

<div class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-20">
  <div class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5">
    <h1 class="text-center text-2xl font-semibold">{$t("payments.enterWalletPass")}</h1>
    <form onsubmit={preventDefault(handleSubmit)}>
      <div class="relative mb-5">
        {#if revealPassword}
          <input
            name="password"
            data-testid="walletpass-input"
            type="text"
            required
            bind:value={password}
            autocapitalize="none"
            use:focus
          />
        {:else}
          <input
            name="password"
            data-testid="walletpass-input"
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
          <iconify-icon
            noobserver
            icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
            width="32"
          ></iconify-icon>
        </button>
      </div>
      <div class="mb-5 space-y-2">
        <label for="rememberFor" class="text-sm text-gray-500">Remember for</label>
        <select
          id="rememberFor"
          class="w-full"
          value={rememberForMs}
          onchange={(e) => (rememberForMs = Number((e.target as HTMLSelectElement).value))}
        >
          {#each rememberForOptions as option}
            <option value={option.ms}>{option.label}</option>
          {/each}
        </select>
      </div>
      <div class="w-full flex justify-center gap-2">
        <button
          type="button"
          data-testid="walletpass-cancel"
          class="border rounded-2xl font-semibold mx-auto py-5 px-6 hover:opacity-80 mx-auto grow"
          onclick={cancel}
          onkeydown={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
        <button
          type="submit"
          data-testid="walletpass-submit"
          class="border rounded-2xl font-semibold mx-auto py-5 px-6 hover:opacity-80 mx-auto grow"
        >
          <div class="my-auto">Submit</div>
        </button>
      </div>
    </form>
  </div>
</div>
