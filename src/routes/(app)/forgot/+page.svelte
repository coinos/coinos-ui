<script>
  import { focus } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { fly } from "svelte/transition";

  export let form;
  let email;
  let loading;
</script>

<div class="pt-10">
  <div class="w-[243px] mx-auto mb-10">
    <a href="/">
      <img src="images/logo.png" alt="" class="dark:hidden block" />
			<img src="images/logo-white.png" alt="" class="hidden dark:block" />
    </a>
  </div>

  <div class="flex justify-center items-center">
    <div
      class="shadow-xl dark:bg-stone-800  rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]"
    >
      <h1 class="text-4xl font-bebasNeue tracking-[0.25rem] font-bold text-center dark:text-gray-50">{$t("login.reset")}</h1>

      {#if form?.error}
        <div class="text-red-600 text-center" in:fly>
          {form.error}
        </div>
      {/if}

      {#if form?.success}
        <div class="text-secondary dark:text-gray-200">
          A password reset link will be sent to your email if we have it on
          file.
        </div>

        <div class="flex w-full">
          <a
            href="/login"
            class="bg-black text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80 text-center dark:bg-swapee-purple active:scale-95 transition-all"
          >
            Continue
          </a>
        </div>
      {:else}
        <form class="space-y-5" method="POST" use:enhance>
          <div>
            <label for="email" class="font-semibold">{$t("login.email")}</label>
            <input
              name="email"
              type="text"
              required
              class="input-swapee mt-1"
              bind:value={email}
              use:focus
              autocapitalize="none"
            />
          </div>

          <button
            type="submit"
            class="bg-black dark:bg-swapee-purple active:scale-95 transition-all text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80"
            disabled={loading}
          >
            {#if loading}
              <Spinner />
            {:else}
              {$t("login.submit")}
            {/if}
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>
