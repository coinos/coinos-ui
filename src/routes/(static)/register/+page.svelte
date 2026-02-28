<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import punks from "$lib/punks";
  import { avatar } from "$lib/store";
  import { focus } from "$lib/utils";
  import { t } from "$lib/translations";
  import { NumberDictionary, uniqueNamesGenerator, animals } from "unique-names-generator";

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

  let refresh = async (e: any) => {
    e.preventDefault();
    cleared = false;

    username = uniqueNamesGenerator({
      dictionaries: [animals, NumberDictionary.generate({ min: 10, max: 99 })],
      length: 2,
      separator: "",
    });
  };

  let avatarInput: HTMLInputElement = $state() as any;
  let decr = () => (index = index <= 0 ? 63 : index - 1);
  let incr = () => (index = index >= 63 ? 0 : index + 1);
  let selectAvatar = () => avatarInput.click();

  let progress: any;
  let handleFile = async ({ target }: { target: HTMLInputElement }) => {
    let type = "picture";
    let file = target.files![0];
    if (!file) return;

    if (file.size > 10000000) return;
    $avatar = { file, type, progress };

    var reader = new FileReader();
    reader.onload = async (e: any) => {
      src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  let src: string = $derived(`/api/public/${punks[index]}.webp`);

  let continueToAuth = () => {
    let name = (username || "").replace(/\s*/g, "");
    if (!name) return;
    goto(`/register/auth?username=${encodeURIComponent(name)}&index=${index}`);
  };
</script>

<div class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 space-y-5 mb-20">
  <h1 class="text-2xl font-bold text-center">{$t("login.createAccount")}</h1>
  <input type="file" accept="image/*" class="hidden!" bind:this={avatarInput} onchange={(e: any) => handleFile(e)} />

  <div class="relative">
    <button
      class="absolute w-8 h-12 left-12 bg-base-100 rounded top-12"
      onclick={decr}
      aria-label="Previous"
    >
      <iconify-icon noobserver icon="ph:caret-left-bold" width="32"></iconify-icon>
    </button>
    <button class="block relative w-32 mx-auto" onclick={selectAvatar}>
      <div
        class="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex mx-auto relative"
      >
        <img
          {src}
          class="w-full h-full object-cover object-center overflow-hidden"
          alt={username}
        />
      </div>
      <div class="absolute bg-base-100 rounded-full px-3 py-1 mx-auto -right-6 -bottom-2 z-10 flex items-center gap-1 text-base">
        <iconify-icon noobserver icon="ph:camera-bold" width="24"></iconify-icon>
        Upload
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
        placeholder={$t("login.username")}
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && continueToAuth()}
      />
      <span class="bg-base-300 whitespace-nowrap select-none self-stretch flex items-center px-3">@coinos.io</span>
    </label>

    <button type="button" class="btn gap-2" onclick={refresh}>
      <iconify-icon noobserver icon="ph:dice-three-bold" width="32"></iconify-icon>
      Random username
    </button>

    <button class="btn btn-accent" onclick={continueToAuth}>
      Continue
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
