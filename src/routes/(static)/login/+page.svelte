<script>
  import { run, preventDefault } from "svelte/legacy";
  import handler from "$lib/handler";

  import { onMount } from "svelte";
  import { applyAction, deserialize } from "$app/forms";
  import { tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import Pinpad from "$comp/Pinpad.svelte";
  import { focus, fail } from "$lib/utils";
  import { password, pin, loginRedirect } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { generate } from "$lib/nostr";
  import { invalidateAll } from "$app/navigation";

  onMount(() => {
    $pin = undefined;
    localStorage.clear();
    sessionStorage.clear();

    let lang = $page.url.searchParams.get("lang");
    if (lang) document.cookie = `lang=${lang} ;`;
  });

  let { form } = $props();

  let token = $state("");
  let code = [];
  let redirect;

  $password = undefined;

  let cancel = () => (need2fa = false);

  let username = $state(),
    email,
    btn = $state();

  $effect(() => form && ({ username, password: $password } = form));
  let need2fa = $derived(form?.message === "2fa");
  $effect(() => {
    if (need2fa && form.token === token) token = "";
  });

  let revealPassword = $state(false);

  async function handleSubmit(e) {
    let data = new FormData(this);
    let user = Object.fromEntries(data);

    for (let k in user) {
      data.set(k, user[k]);
    }

    const response = await fetch("/login", {
      method: "POST",
      body: data,
    });

    const result = deserialize(await response.text());

    if (result.type === "success") {
      await invalidateAll();
    }

    applyAction(result);
  }

  $effect(() => {
    token?.length === 6 &&
      tick().then(() => {
        btn.click();
      });
  });
</script>

<div
  class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 mb-20"
>
  <h1 class="text-2xl font-bold text-center">{$t("login.signIn")}</h1>

  {#if form?.error && !form?.message.includes("2fa")}
    <div class="text-red-600 text-center" in:fly>
      {form.error}
    </div>
  {/if}

  <form use:enhance class="space-y-5" onsubmit={handleSubmit} method="POST">
    <input
      type="hidden"
      name="loginRedirect"
      value={$loginRedirect || $page.url.searchParams.get("redirect")}
    />
    <input type="hidden" name="token" value={token} />

    <input
      name="username"
      type="text"
      required
      bind:value={username}
      use:focus
      autocapitalize="none"
      placeholder={$t("login.username")}
    />

    <label
      for="password"
      class="input flex items-center justify-center gap-2 w-full"
    >
      {#if revealPassword}
        <input
          class="clean"
          name="password"
          type="text"
          required
          bind:value={$password}
          autocapitalize="none"
          placeholder={$t("login.password")}
        />
      {:else}
        <input
          class="clean"
          name="password"
          type="password"
          required
          bind:value={$password}
          autocapitalize="none"
          placeholder={$t("login.password")}
        />
      {/if}
      <iconify-icon
        class="cursor-pointer ml-auto"
        onclick={() => (revealPassword = !revealPassword)}
        icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
        width="32"
      ></iconify-icon>
    </label>

    <div class="flex justify-end items-center">
      <a href="/forgot" class="underline underline-offset-4 text-secondary"
        >{$t("login.forgotUserOrPassword")}</a
      >
    </div>

    <button type="submit" class="btn" bind:this={btn}>
      {$t("login.signIn")}
    </button>

    <p class="text-secondary text-center font-medium">
      {$t("login.noAccount")}
      <a
        href={"/register"}
        class="block md:inline text-secondary underline underline-offset-4 hover:opacity-80"
      >
        {$t("login.register")}
      </a>
    </p>
  </form>
</div>

{#if need2fa && token.length < 6}
  <div
    class="fixed bg-base-100 bg-opacity-90 inset-0 h-full w-full z-50 cursor-default"
    onclick={(e) => e.stopPropagation()}
  >
    <div
      class="mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 max-w-lg"
    >
      <h1 class="text-center text-2xl font-semibold">2FA</h1>
      <Pinpad bind:v={token} {cancel} />

      <div class="w-full flex">
        <button class="btn" onclick={cancel}>
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
