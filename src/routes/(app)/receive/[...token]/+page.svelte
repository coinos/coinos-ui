<script lang="ts">
  import { run } from "svelte/legacy";

  import { page } from "$app/stores";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { back, fail, focus } from "$lib/utils";

  let { data = $bindable(), form } = $props();

  let { token } = data;
  data.subject = data.user;

  let el = $state(),
    text = $state(),
    pasted = $state(),
    w = $state();

  let keypress = (e) => e.key === "Enter" && (e.preventDefault() || el.click());

  let paste = async () => {
    text = await navigator.clipboard.readText();
  };

  run(() => {
    if (browser && pasted && text) el.click() && (pasted = false);
  });
</script>

<svelte:window bind:innerWidth={w} />

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("user.dashboard.receive")}
  </h1>

  <form method="POST" use:enhance class="space-y-2 text-xl">
    {#if form?.error}
      <div class="mb-5">
        <div class="text-red-600">
          {form.error === "default" ? $t("error.unrecognizedInput") : form.error}
        </div>
      </div>
    {/if}

    <div class="mb-2">
      <textarea
        use:focus
        name="text"
        placeholder={$t("payments.voucherText")}
        onkeypress={keypress}
        class="w-full p-4 border rounded-xl h-32 text-xl"
        bind:value={text}
        onpaste={() => (pasted = true)}
        autocapitalize="none"
      ></textarea>
    </div>

    <div class="flex gap-2">
      <a href="/scan" class="contents">
        <button type="button" class="btn !w-auto flex-grow">
          <iconify-icon noobserver icon="ph:camera-bold" width="32"></iconify-icon>
          <div class="my-auto">{$t("user.send.scan")}</div>
        </button>
      </a>

      <button type="button" class="btn !w-auto flex-grow" onclick={paste}>
        <iconify-icon noobserver icon="ph:clipboard-text-bold" width="32"></iconify-icon>
        <div class="my-auto">{$t("user.send.paste")}</div>
      </button>
    </div>

    <button bind:this={el} type="submit" class="btn">
      {$t("user.send.next")}
    </button>
  </form>
</div>
