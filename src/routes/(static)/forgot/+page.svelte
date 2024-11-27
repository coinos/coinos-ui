<script>
  import { focus } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { fly } from "svelte/transition";

  let { form } = $props();
  let email = $state();
  let loading;
</script>

<div
  class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 mb-20 space-y-5"
>
  <h1 class="text-2xl font-bold text-center">{$t("login.reset")}</h1>

  {#if form?.error}
    <div class="text-red-600 text-center" in:fly>
      {form.error}
    </div>
  {/if}

  {#if form?.success}
    <div class="text-secondary">
      {$t("login.resetSent")}
    </div>

    <div class="flex w-full">
      <a href="/login" class="btn">
        {$t("login.continue")}
      </a>
    </div>
  {:else}
    <form class="space-y-5" method="POST" use:enhance>
      <div>
        <input
          placeholder={$t("login.email")}
          name="email"
          type="text"
          required
          class="bg-primary"
          bind:value={email}
          use:focus
          autocapitalize="none"
        />
      </div>

      <div class="text-secondary">
        {$t("login.resetDesc")}
        <a href="mailto:support@coinos.io" class="font-bold"
          >support@coinos.io</a
        >
      </div>

      <button type="submit" class="btn" disabled={loading}>
        {#if loading}
          <Spinner />
        {:else}
          {$t("login.submit")}
        {/if}
      </button>
    </form>
  {/if}
</div>
