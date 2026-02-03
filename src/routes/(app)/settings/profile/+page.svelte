<script>
  import { tick } from "svelte";
  import { avatar, banner as bannerStore } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import PasswordInput from "$comp/PasswordInput.svelte";

  let { data } = $props();
  let { user } = $derived(data);
  let { id } = $derived(user);
  let about = $state();
  let banner = $state();
  let picture = $state();
  let display = $state();
  let username = $state();

  let avatarFile,
    avatarInput = $state(),
    bannerFile,
    password = $state(),
    revealPassword = $state(),
    bannerInput = $state();

  let selectAvatar = () => avatarInput.click();
  let selectBanner = () => bannerInput.click();

  let percent;
  let progress = async (event) => {
    percent = Math.round((event.loaded / event.total) * 100);
  };

  let tooLarge = $state({});

  let handleFile = async ({ target }, type) => {
    tooLarge[type] = false;
    let file = target.files[0];
    if (!file) return;

    if (file.size > 10000000) return (tooLarge[type] = true);

    if (type === "picture") {
      $avatar = { id, file, type, progress };
    } else if (type === "banner") {
      $bannerStore = { id, file, type, progress };
    }

    var reader = new FileReader();
    reader.onload = async (e) => {
      if (type === "picture") {
        $avatar.src = e.target.result;
      } else if (type === "banner") {
        $bannerStore.src = e.target.result;
      }
    };

    reader.readAsDataURL(file);
  };

  let url = $derived(`${$page.url.host}/${username}`);
  let full = $derived(`${$page.url.protocol}//${url}`);
  let addr = $derived(`${username}@${$page.url.host}`);

  $effect(() => {
    if (!user) return;
    if (typeof about === "undefined") about = user.about;
    if (typeof banner === "undefined") banner = user.banner;
    if (typeof picture === "undefined") picture = user.picture;
    if (typeof display === "undefined") display = user.display;
    if (typeof username === "undefined") username = user.username;
  });
</script>

<div>
  <label for="username" class="font-bold mb-1 block"
    >{$t("user.settings.username")}</label
  >
  <div class="flex mb-2">
    <input type="text" name="username" bind:value={username} />
  </div>
</div>

<input type="hidden" name="confirm" bind:value={password} />

<div>
  <label for="password" class="block font-bold block mb-1"
    >{$t("user.settings.newPassword")}</label
  >

  <PasswordInput bind:value={password} placeholder="(Leave blank to keep unchanged)" />
</div>

<div>
  <label for="display" class="font-bold mb-1 block"
    >{$t("user.settings.displayName")}</label
  >
  <input type="text" name="display" bind:value={display} />
</div>

<div class="space-y-2">
  <span class="font-bold">{$t("user.settings.profileImage")}</span>

  <div class="flex">
    {#if $avatar || picture}
      <div
        class="relative rounded-full overflow-hidden text-center w-20 h-20 my-auto hover:opacity-80 cursor-pointer"
        onclick={selectAvatar}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && selectAvatar()}
        role="button"
        tabindex="0"
      >
        <img
          src={$avatar?.src || picture}
          class="absolute w-full h-full object-cover object-center visible overflow-hidden"
          alt={username}
        />
      </div>
    {:else}
      <div
        class="rounded-full border-4 border-base-100 p-4 bg-base-200 w-24 h-24 my-auto hover:opacity-80 cursor-pointer"
        onclick={selectAvatar}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && selectAvatar()}
        role="button"
        tabindex="0"
      ></div>
    {/if}
    <div class="ml-2 p-2">
      <!-- found missing translation -->
      <button
        type="button"
        class="btn"
        onclick={selectAvatar}
        onkeydown={selectAvatar}>{$t("user.settings.select")}</button
      >
      <input
        type="file"
        class="hidden!"
        bind:this={avatarInput}
        onchange={(e) => handleFile(e, "picture")}
      />
    </div>
  </div>

  {#if tooLarge["avatar"]}
    <div class="text-red-600">Max file size 10MB</div>
  {/if}
</div>

<div class="space-y-2">
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.bannerImage")}</span>
  </div>

  {#if $bannerStore || banner}
    <button
      type="button"
      class="w-full"
      onclick={selectBanner}
      aria-label="Select banner"
    >
      <img
        src={$bannerStore ? $bannerStore.src : banner}
        class="w-full object-cover object-center visible overflow-hidden h-48 mb-4 hover:opacity-80"
        alt="Banner"
      />
    </button>
  {:else}
    <div
      class="bg-base-200 w-full h-48 mb-4 cursor-pointer hover:opacity-80"
      onclick={selectBanner}
      onkeydown={(e) => (e.key === "Enter" || e.key === " ") && selectBanner()}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <button
    type="button"
    class="btn !w-auto"
    onclick={selectBanner}
    onkeydown={selectBanner}>{$t("user.settings.select")}</button
  >
  <input
    type="file"
    class="hidden!"
    bind:this={bannerInput}
    onchange={(e) => handleFile(e, "banner")}
  />

  {#if tooLarge["banner"]}
    <div class="text-red-600">Max file size 10MB</div>
  {/if}
</div>

<div>
  <label for="about" class="font-bold mb-1 block"
    >{$t("user.settings.about")}</label
  >
  <textarea
    type="text"
    name="about"
    bind:value={about}
    placeholder={$t("user.settings.aboutPlaceholder")}
  ></textarea>
</div>
