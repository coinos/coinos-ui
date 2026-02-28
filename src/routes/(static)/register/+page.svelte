<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import punks from "$lib/punks";
  import { avatar } from "$lib/store";
  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";


  let isMobile = $derived(browser && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  let { data }: any = $props();

  let username: string | undefined = $state();
  let index = $state((() => data.index)());

  let cleared: boolean;
  let clear = () => {
    if (!cleared) {
      cleared = true;
      username = "";
    }
  };


  let cameraInput: HTMLInputElement = $state() as any;
  let galleryInput: HTMLInputElement = $state() as any;
  let showUploadModal = $state(false);
  let decr = () => (index = index <= 0 ? 63 : index - 1);
  let incr = () => (index = index >= 63 ? 0 : index + 1);

  let progress: any;
  let handleFile = async ({ target }: { target: HTMLInputElement }) => {
    let type = "picture";
    let file = target.files![0];
    if (!file) return;

    if (file.size > 10000000) return;
    $avatar = { file, type, progress };
    showUploadModal = false;

    var reader = new FileReader();
    reader.onload = async (e: any) => {
      src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  let src: string = $derived(`/api/public/${punks[index]}.webp`);

  let error = $state("");
  let continueToAuth = async () => {
    let name = (username || "").replace(/\s/g, "").toLowerCase();
    if (!name) return;
    error = "";
    let r = await fetch(`/api/users/${name}`);
    if (r.ok) {
      error = `Username ${name} is taken`;
    } else {
      goto(`/register/auth?username=${encodeURIComponent(name)}&index=${index}`);
    }
  };
</script>

<div class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 space-y-5 mb-20">
  <h1 class="text-2xl font-bold text-center">{$t("login.createAccount")}</h1>
  <input type="file" accept="image/*" capture="user" class="hidden!" bind:this={cameraInput} onchange={(e: any) => handleFile(e)} />
  <input type="file" accept="image/*" class="hidden!" bind:this={galleryInput} onchange={(e: any) => handleFile(e)} />

  <div class="relative">
    <button
      class="absolute w-8 h-12 left-12 bg-base-100 rounded top-12"
      onclick={decr}
      aria-label="Previous"
    >
      <iconify-icon noobserver icon="ph:caret-left-bold" width="32"></iconify-icon>
    </button>
    <button class="block relative w-32 mx-auto" onclick={() => isMobile ? (showUploadModal = true) : galleryInput.click()}>
      <div
        class="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex mx-auto relative"
      >
        <img
          {src}
          class="w-full h-full object-cover object-center overflow-hidden"
          alt={username}
        />
      </div>
      <div class="absolute bg-base-100 rounded-full p-2 -right-2 -bottom-2 z-10">
        <iconify-icon noobserver icon="ph:folder-bold" width="24"></iconify-icon>
      </div>
    </button>
    <button
      class="absolute w-8 h-12 right-12 bg-base-100 rounded top-12"
      onclick={incr}
      aria-label="Next"
    >
      <iconify-icon noobserver icon="ph:caret-right-bold" width="32"></iconify-icon>
    </button>
  </div>

  {#if error}
    <div class="text-red-600 text-center">{error}</div>
  {/if}

  <div class="space-y-3">
    <label for="username" class="input flex items-center gap-2 w-full pr-0! overflow-hidden">
      <input
        class="clean min-w-0 shrink"
        use:focus
        name="username"
        type="text"
        required
        bind:value={username}
        onfocus={clear}
        autocapitalize="none"
        placeholder={$t("login.usernamePlaceholder")}
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && continueToAuth()}
      />
      <span class="at-suffix font-bold whitespace-nowrap select-none self-stretch flex items-center px-3">@coinos.io</span>
    </label>

    <button class="btn btn-accent" onclick={continueToAuth}>
      {$t("login.continue")}
    </button>

    <p class="text-secondary text-center font-medium">
      {$t("login.haveAccount")}
      <a
        href={"/login" + $page.url.search}
        class="block md:inline text-secondary underline underline-offset-4 hover:opacity-80"
      >
        {$t("login.signIn")}
      </a>
    </p>
  </div>
</div>

{#if showUploadModal}
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32"
    role="button"
    tabindex="0"
    onclick={() => (showUploadModal = false)}
    onkeydown={(e) => e.key === "Escape" && (showUploadModal = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="bg-base-100 rounded-2xl p-6 w-full max-w-sm space-y-3" role="none" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-lg font-semibold text-center">Upload photo</h2>
      {#if isMobile}
        <button class="btn w-full gap-2" onclick={() => cameraInput.click()}>
          <iconify-icon noobserver icon="ph:camera-bold" width="24"></iconify-icon>
          Take photo
        </button>
      {/if}
      <button class="btn w-full gap-2" onclick={() => galleryInput.click()}>
        <iconify-icon noobserver icon="ph:images-bold" width="24"></iconify-icon>
        Choose from gallery
      </button>
      <button class="btn w-full" onclick={() => (showUploadModal = false)}>
        Cancel
      </button>
    </div>
  </div>
{/if}

<style>
  .at-suffix {
    background: black;
    color: white;
  }
  :global([data-theme="black"]) .at-suffix {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
</style>
