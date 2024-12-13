<script>
  import { tick } from "svelte";
  import { avatar, banner as bannerStore } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  let { data } = $props();
  let { user } = $derived(data);
  let { id } = user;
  let { address, banner, profile, display, email, username, verified } =
    $state(user);

  let avatarFile,
    avatarInput = $state(),
    bannerFile,
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

    if (type === "profile") {
      $avatar = { id, file, type, progress };
    } else if (type === "banner") {
      $bannerStore = { id, file, type, progress };
    }

    var reader = new FileReader();
    reader.onload = async (e) => {
      if (type === "profile") {
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
    if (email !== user.email) verified = false;
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

<div>
  <label for="display" class="font-bold mb-1 block"
    >{$t("user.settings.displayName")}</label
  >
  <input type="text" name="display" bind:value={display} />
</div>

<div class="space-y-1 relative">
  <label for="email" class="font-bold block">{$t("user.settings.email")}</label>
  <p class="text-secondary">
    {$t("user.settings.emailDescription")}
  </p>

  <label
    class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
  >
    <input type="text" name="email" class="clean" bind:value={email} />
    {#if verified}
      <iconify-icon icon="ph:check-bold" class="text-success ml-auto" width="32"
      ></iconify-icon>
    {:else if email}
      <iconify-icon icon="ph:clock-bold" class="text-warning ml-auto" width="32"
      ></iconify-icon>
    {/if}
  </label>
</div>

<div class="space-y-2">
  <span class="font-bold">{$t("user.settings.profileImage")}</span>

  <div class="flex">
    {#if $avatar || profile}
      <div
        class="relative rounded-full overflow-hidden text-center w-20 h-20 my-auto hover:opacity-80 cursor-pointer"
        onclick={selectAvatar}
        onkeydown={selectAvatar}
      >
        <img
          src={$avatar?.src || `/api/public/${profile}.webp`}
          class="absolute w-full h-full object-cover object-center visible overflow-hidden"
          alt={username}
        />
      </div>
    {:else}
      <div
        class="rounded-full border-4 border-base-100 p-4 bg-base-200 w-24 h-24 my-auto hover:opacity-80 cursor-pointer"
        onclick={selectAvatar}
        onkeydown={selectAvatar}
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
        class="hidden"
        bind:this={avatarInput}
        onchange={(e) => handleFile(e, "profile")}
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
    <img
      src={$bannerStore ? $bannerStore.src : `/api/public/${banner}.webp`}
      class="w-full object-cover object-center visible overflow-hidden h-48 mb-4 hover:opacity-80"
      onclick={selectBanner}
      onkeydown={selectBanner}
      alt="Banner"
    />
  {:else}
    <div
      class="bg-base-200 w-full h-48 mb-4 cursor-pointer hover:opacity-80"
      onclick={selectBanner}
      onkeydown={selectBanner}
      alt="Banner"
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
    class="hidden"
    bind:this={bannerInput}
    onchange={(e) => handleFile(e, "banner")}
  />

  {#if tooLarge["banner"]}
    <div class="text-red-600">Max file size 10MB</div>
  {/if}
</div>

<div>
  <label for="address" class="font-bold mb-1 block"
    >{$t("user.settings.about")}</label
  >
  <textarea
    type="text"
    name="address"
    bind:value={address}
    placeholder={$t("user.settings.aboutPlaceholder")}
  ></textarea>
</div>
