<script>
  import punks from "$lib/punks";
  import { upload } from "$lib/upload";
  import { afterNavigate, invalidateAll } from "$app/navigation";
  import { applyAction, deserialize } from "$app/forms";
  import { tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";

  import Pin from "$comp/Pin.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";

  import { focus, fail } from "$lib/utils";
  import { avatar, password, loginRedirect } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { generate } from "$lib/nostr";
  import {
    NumberDictionary,
    uniqueNamesGenerator,
    colors,
    adjectives,
    animals,
  } from "unique-names-generator";

  export let form;
  export let data;

  $: data && ($avatar = undefined);
  let username;
  let { index } = data;

  let cleared;
  let clear = () => {
    if (!cleared) {
      cleared = true;
      username = "";
      $password = "";
      revealPassword = false;
    }
  };

  let refresh = async () => {
    username = uniqueNamesGenerator({
      dictionaries: [animals, NumberDictionary.generate({ min: 10, max: 99 })],
      length: 2,
      separator: "",
    });

    $password = uniqueNamesGenerator({
      dictionaries: [colors, NumberDictionary.generate({ min: 100, max: 999 })],
      length: 2,
      separator: "",
    });

    revealPassword = true;
  };

  afterNavigate(async () => {
    try {
      await invalidateAll();
    } catch (e) {
      console.log(e);
    }
  });

  let token, formElement;
  let code = [];
  let redirect;

  $: need2fa = form?.message === "2fa";
  let cancel = () => (need2fa = false);
  $: if (form?.message === "2fa" && form.token === token) token = "";

  let email, btn;

  $: update(form);
  let update = (form) => form && ({ username, password: $password } = form);

  $: token && token?.length === 6 && tick().then(() => btn.click());

  let revealPassword;

  let loading;
  async function handleSubmit(e) {
    loading = true;

    let data = new FormData(this);
    let user = Object.fromEntries(data);
    await generate(user);

    for (let k in user) {
      data.set(k, user[k]);
    }

    data.set("profile", punks[index]);
    if ($avatar) {
      try {
        let { hash } = JSON.parse(
          await upload($avatar.file, $avatar.type, $avatar.progress, token),
        );

        data.set("profile", hash);
        await fetch(`/api/public/${hash}.webp`, {
          cache: "reload",
          mode: "no-cors",
        });
      } catch (e) {
        console.log("problem uploading avatar", e);
      }
    }

    const response = await fetch("/register", {
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

  let avatarInput;
  $: src = `/api/public/${punks[index]}.webp`;
  let decr = () => (index = index <= 0 ? 63 : index - 1);
  let incr = () => (index = index >= 63 ? 0 : index + 1);
  let selectAvatar = () => avatarInput.click();

  let progress;
  let handleFile = async ({ target }) => {
    let type = "profile";
    let file = target.files[0];
    if (!file) return;

    if (file.size > 10000000) form.error = "File too large";
    $avatar = { file, type, progress };

    var reader = new FileReader();
    reader.onload = async (e) => {
      src = e.target.result;
    };

    reader.readAsDataURL(file);
  };
</script>

{#if need2fa}
  <Pin bind:value={token} title="Enter 2FA Code" {cancel} notify={false} />
{/if}

<div
  class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 space-y-5 mb-20"
>
  <h1 class="text-2xl font-bold text-center">{$t("login.createAccount")}</h1>
  <input
    type="file"
    class="hidden"
    bind:this={avatarInput}
    on:change={(e) => handleFile(e, "profile")}
  />

  <div class="relative">
    <button
      class="absolute w-8 h-12 left-12 bg-base-100 rounded top-12"
      on:click={decr}
    >
      <Icon icon="chevron-left" style="w-8 " />
    </button>
    <button class="block relative w-32 mx-auto" on:click={selectAvatar}>
      <button
        class="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex mx-auto relative"
      >
        <img
          {src}
          class="w-full h-full object-cover object-center overflow-hidden"
          alt={username}
        />
      </button>
      <button
        class="absolute bg-base-100 rounded-full p-2 mx-auto right-0 bottom-0 z-10 bg-opacity-80"
      >
        <Icon icon="upload" style="w-8" />
      </button>
    </button>
    <button
      class="absolute w-8 h-12 right-12 bg-base-100 rounded top-12"
      on:click={incr}
    >
      <Icon icon="chevron-left" style="w-8 rotate-180" />
    </button>
  </div>

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

    <div class="relative">
      <label for="username" class="font-semibold">{$t("login.username")}</label>
      <input
        use:focus
        name="username"
        type="text"
        required
        bind:value={username}
        on:focus={clear}
        autocapitalize="none"
      />
      <button
        tabindex="-1"
        type="button"
        on:click={refresh}
        class="absolute right-0 top-4"
      >
        <Icon icon="random" style="w-10 m-4" />
      </button>
    </div>

    <div class="relative">
      <label for="password" class="block font-semibold"
        >{$t("login.password")}</label
      >
      {#if revealPassword}
        <input
          name="password"
          type="text"
          required
          bind:value={$password}
          autocapitalize="none"
        />
      {:else}
        <input
          name="password"
          type="password"
          required
          bind:value={$password}
          autocapitalize="none"
          on:focus={clear}
        />
      {/if}
      <button
        type="button"
        tabindex="-1"
        on:click={() => (revealPassword = !revealPassword)}
        class="absolute right-0 top-4"
      >
        <Icon icon={revealPassword ? "eye" : "eye-off"} style="m-6" />
      </button>
    </div>

    <button type="submit" class="btn" disabled={loading} bind:this={btn}>
      {#if loading}
        <Spinner />
      {:else}
        {$t("login.register")}
      {/if}
    </button>

    <p class="text-secondary text-center font-medium">
      {$t("login.haveAccount")}
      <a
        href={"/login"}
        class="block md:inline text-black underline underline-offset-4 hover:opacity-80"
      >
        {$t("login.signIn")}
      </a>
    </p>
  </form>
</div>
