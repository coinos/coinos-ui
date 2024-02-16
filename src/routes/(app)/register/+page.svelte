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
    console.log("HERE")
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
          await upload($avatar.file, $avatar.type, $avatar.progress, token)
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

<div class="pt-4">
  <div class="w-[243px] mx-auto mb-10 mt-6">
    <a href="/">
      <img src="images/logo.png" alt="" class="dark:hidden block" />
			<img src="images/logo-white.png" alt="" class="hidden dark:block mb-5" />
    </a>
  </div>

  <div class="flex justify-center items-center">
    <div
      class="shadow-xl dark:bg-stone-800 rounded-3xl p-5 sm:p-10 pb-8 sm:pb-12 pt-3 sm:pt-6 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]"
    >
      <input
        type="file"
        class="hidden"
        bind:this={avatarInput}
        on:change={(e) => handleFile(e, "profile")}
      />

      <div class="relative">
        <button
          class="absolute w-8 h-12 left-[5%] min-[400px]:left-12 bg-white dark:bg-stone-700 rounded top-12"
          on:click={decr}
        >
          <Icon icon="chevron-left" style="w-8 dark:invert" />
        </button>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="relative w-32 mx-auto" on:click={selectAvatar}>
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
            class="absolute bg-white dark:bg-stone-700 rounded-full p-2 mx-auto right-0 bottom-0 z-10 bg-opacity-80"
          >
            <Icon icon="upload" style="w-8 dark:invert" />
          </button>
        </div>
        <button
          class="absolute w-8 h-12 right-[5%] min-[400px]:right-12 bg-white dark:bg-stone-700 rounded top-12"
          on:click={incr}
        >
          <Icon icon="chevron-left" style="w-8 rotate-180 dark:invert" />
        </button>
      </div>

      {#if form?.error}
        <div class="text-red-600 text-center" in:fly>
          {form.error}
        </div>
      {/if}

      OHH
      <form
        class="space-y-5"
        on:submit|preventDefault={handleSubmit}
        method="POST"
      >
        <input
          type="hidden"
          name="loginRedirect"
          value={$loginRedirect || $page.url.searchParams.get("redirect")}
        />
        <input type="hidden" name="token" value={token} />

        <div class="relative">
          <label for="username" class="font-semibold"
            >{$t("login.username")}</label
          >
          <input
            use:focus
            tabindex="1"
            name="username"
            type="text"
            required
            class="input-swapee mt-1"
            bind:value={username}
            on:focus={clear}
            autocapitalize="none"
          />
          <button
            type="button"
            on:click={refresh}
            class="absolute right-0 top-5"
            tabindex="5"
          >
            <Icon icon="random" style="w-10 m-4 dark:invert" />
          </button>
        </div>

        <div class="relative">
          <label for="password" class="block font-semibold"
            >{$t("login.password")}</label
          >
          {#if revealPassword}
            <input
              tabindex="2"
              name="password"
              type="text"
              required
              class="input-swapee mt-1"
              bind:value={$password}
              autocapitalize="none"
            />
          {:else}
            <input
              tabindex="2"
              name="password"
              type="password"
              required
              class="input-swapee mt-1"
              bind:value={$password}
              autocapitalize="none"
              on:focus={clear}
            />
          {/if}
          <button
            type="button"
            tabindex="4"
            on:click={() => (revealPassword = !revealPassword)}
            class="absolute right-0 {revealPassword ? 'top-[22px]' : 'top-5'}"
          >
            <Icon icon={revealPassword ? "eye" : "eye-off"} style="m-6 dark:invert" />
          </button>
        </div>

        <p class="text-secondary dark:text-gray-200 text-sm">
          {$t("login.passwordRecommendation")}
        </p>

        <button
          tabindex="3"
          type="button"
          class="bg-black dark:bg-swapee-purple text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80 active:scale-95 transition-all"
          disabled={loading}
          bind:this={btn}
        >
          {#if loading}
            <Spinner />
          {:else}
            {$t("login.register")}
          {/if}
        </button>
      </form>

      <p class="text-secondary dark:text-gray-200 text-center font-medium">
        {$t("login.haveAccount")}
        <a
          href={"/login"}
          class="block md:inline underline underline-offset-4 text-black dark:text-white decoration-swapee-purple hover:opacity-75 decoration-2"
        >
          {$t("login.signIn")}
        </a>
      </p>
    </div>
  </div>
</div>
