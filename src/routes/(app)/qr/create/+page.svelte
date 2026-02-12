<script lang="ts">
  import { run, preventDefault } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import { focus } from "$lib/utils";
  let el = $state(),
    text = $state(),
    pasted = $state();

  let keypress = (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); (el as HTMLElement).click(); } else { pasted = false; } };

  let paste = async () => {
    text = await navigator.clipboard.readText();
    pasted = true;
  };

  let submit = () => goto(`/qr/${encodeURIComponent(text as string)}`);

  run(() => {
    if (browser && pasted && text) { (el as HTMLElement).click(); pasted = false; }
  });
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">Create QR</h1>

  <form onsubmit={preventDefault(submit)} class="space-y-2 text-xl">
    <div class="mb-2">
      <textarea
        use:focus
        name="text"
        placeholder="Enter some text or a URL to put in a QR"
        onkeypress={keypress}
        class="w-full p-4 border rounded-xl h-32 text-xl"
        bind:value={text}
        onpaste={() => (pasted = true)}
        autocapitalize="none"
      ></textarea>
    </div>

    <div class="flex gap-2">
      <button
        type="button"
        class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full bg-primary justify-center gap-2"
        onclick={paste}
      >
        <iconify-icon noobserver icon="ph:clipboard-text-bold" width="32" class="my-auto"
        ></iconify-icon>
        <div class="my-auto">{$t("user.send.paste")}</div>
      </button>

      <button
        bind:this={el}
        type="submit"
        class="flex bg-black text-white border rounded-2xl px-6 py-5 w-full font-bold gap-2 justify-center"
      >
        <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32" class="my-auto invert"
        ></iconify-icon>
        <div class="my-auto">{$t("user.dashboard.go")}</div>
      </button>
    </div>
  </form>
</div>
