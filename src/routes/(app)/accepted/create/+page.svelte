<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  let el = $state(), text = $state(), pasted = $state();

  let keypress = (e) =>
    e.key === "Enter" ? e.preventDefault() || el.click() : (pasted = false);

  let paste = async () => {
    text = await navigator.clipboard.readText();
    pasted = true;
  };

  let submit = () => goto(`/qr/${encodeURIComponent(text)}`);

  run(() => {
    if (browser && pasted && text) el.click() && (pasted = false);
  });
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Create QR
  </h1>

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
        <Icon icon="paste" style="w-8 my-auto" />
        <div class="my-auto">{$t("user.send.paste")}</div>
      </button>

      <button
        bind:this={el}
        type="submit"
        class="flex bg-black text-white border rounded-2xl px-6 py-5 w-full font-bold gap-2 justify-center"
      >
        <Icon icon="send" style="w-8 my-auto invert" />
        <div class="my-auto">{$t("user.dashboard.go")}</div>
      </button>
    </div>
  </form>
</div>
