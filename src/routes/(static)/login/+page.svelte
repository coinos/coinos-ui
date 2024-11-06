<script>
  import { onMount } from "svelte";
  import { applyAction, deserialize } from "$app/forms";
  import { tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import Pin from "$comp/Pin.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
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

  export let form;

  let token, formElement;
  let code = [];
  let redirect;

  $password = undefined;

  $: need2fa = form?.message === "2fa";
  let cancel = () => (need2fa = false);
  $: if (form?.message === "2fa" && form.token === token) token = "";

  let username, email, btn;

  $: update(form);
  let update = (form) => form && ({ username, password: $password } = form);

  $: token && token?.length === 6 && tick().then(() => btn.click());

  let revealPassword = false;

  let loading;
  async function handleSubmit(e) {
    loading = true;

    let data = new FormData(this);
    let user = Object.fromEntries(data);
    await generate(user);

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
    loading = false;
  }
</script>

{#if need2fa}
  <Pin bind:value={token} title="Enter 2FA Code" {cancel} notify={false} />
{/if}

<div
  class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 mb-20"
>
  <h1 class="text-2xl font-bold text-center">{$t("login.signIn")}</h1>

  {#if form?.error}
    <div class="text-red-600 text-center" in:fly>
      {form.error}
    </div>
  {/if}

  <form class="space-y-5" on:submit|preventDefault={handleSubmit} method="POST">
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

    <label for="password" class="input flex items-center justify-center gap-2 w-full">
      {#if revealPassword}
        <input
          class="clean w-full grow focus:!outline-offset-0"
          name="password"
          type="text"
          required
          bind:value={$password}
          autocapitalize="none"
          placeholder={$t("login.password")}
        />
      {:else}
        <input
          class="clean w-full grow focus:!outline-offset-0"
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
        on:click={() => (revealPassword = !revealPassword)}
        icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
        width="32"
      />
    </label>

    <div class="flex justify-end items-center">
      <a
        href="/forgot"
        class="underline underline-offset-4 text-secondary"
        >{$t("login.forgotUserOrPassword")}</a
      >
    </div>

    <button type="submit" class="btn" disabled={loading} bind:this={btn}>
      {#if loading}
        <Spinner />
      {:else}
        {$t("login.signIn")}
      {/if}
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
