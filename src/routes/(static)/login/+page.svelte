<script>
  import { browser } from "$app/environment";
  import handler from "$lib/handler";
  import { applyAction, deserialize } from "$app/forms";
  import { onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import Pinpad from "$comp/Pinpad.svelte";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { focus, fail } from "$lib/utils";
  import { password, signer, pin, loginRedirect } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { sign } from "$lib/nostr";
  import { invalidateAll } from "$app/navigation";

  let { data, form } = $props();

  onMount(() => {
    if (browser) {
      setTimeout(() => {
        password.set(undefined);
        pin?.set(undefined);
        signer.set(undefined);
        localStorage.clear();
        sessionStorage.clear();
      }, 50);
    }
  });

  onMount(() => {
    let lang = $page.url.searchParams.get("lang");
    if (lang) document.cookie = `lang=${lang} ;`;
  });

  let { challenge } = $derived(data);
  let token = $state("");

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
    e.preventDefault();
    let data = new FormData(this);
    let user = Object.fromEntries(data);

    for (let k in user) {
      data.set(k, user[k]);
    }

    const response = await fetch("?/login", {
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

  let redirect = $derived(
    $loginRedirect || $page.url.searchParams.get("redirect"),
  );

  let nostrLogin = async () => {
    let event = {
      kind: 1,
      created_at: Date.now(),
      content: challenge,
      tags: [],
    };

    let signedEvent = await sign(event);

    const formData = new FormData();

    try {
      formData.append("loginRedirect", redirect);
      formData.append("token", token);
      formData.append("event", JSON.stringify(signedEvent));
      formData.append("challenge", challenge);

      let response = await fetch("/login?/nostr", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      applyAction(result);
    } catch (e) {
      fail(e.message);
    }
  };
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

  <form
    use:enhance
    class="space-y-5"
    onsubmit={handleSubmit}
    method="POST"
    action="?/login"
  >
    <input type="hidden" name="loginRedirect" value={redirect} />
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

    <PasswordInput bind:value={$password} placeholder={$t("login.password")} />

    <div class="flex justify-end items-center">
      <a href="/forgot" class="underline underline-offset-4 text-secondary"
        >{$t("login.forgotUserOrPassword")}</a
      >
    </div>

    <button type="submit" class="btn btn-accent" bind:this={btn}>
      {$t("login.signIn")}
    </button>

    <button type="button" class="btn" onclick={nostrLogin}>
      {#if $signer?.ready}
        <div class="shrink">
          <Spinner />
        </div>
      {:else}
        <img src="/images/nostr.png" class="w-8" />
      {/if}
      <div class="my-auto">{$t("login.nostr")}</div>
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
    role="dialog"
    aria-labelledby="title"
  >
    <div
      class="mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 max-w-lg"
    >
      <h1 id="title" class="text-center text-2xl font-semibold">2FA</h1>
      <Pinpad bind:v={token} {cancel} />

      <div class="w-full flex">
        <button class="btn" onclick={cancel}>
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
