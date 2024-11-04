<script>
  import { page } from "$app/stores";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { back, fail, focus } from "$lib/utils";

  export let data;
  export let form;
  data.subject = data.user;

  let { contacts } = data;

  let el, text, pasted, w;

  let keypress = (e) =>
    e.key === "Enter" ? e.preventDefault() || el.click() : (pasted = false);

  let paste = async () => {
    text = await navigator.clipboard.readText();
    await tick();
    pasted = true;
  };

  $: if (browser && pasted && text) el.click() && (pasted = false);
</script>

<svelte:window bind:innerWidth={w} />

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.send")}
  </h1>

  <form method="POST" use:enhance class="space-y-2 text-xl">
    {#if form?.error}
      <div class="mb-5">
        <div class="text-red-600">
          {form.error === "default"
            ? $t("error.unrecognizedInput")
            : form.error}
        </div>
      </div>
    {/if}

    <textarea
      use:focus
      name="text"
      placeholder={$t("user.send.placeholder")}
      on:keypress={keypress}
      class="w-full p-4 border rounded-xl h-32 text-xl"
      bind:value={text}
      on:paste={() => (pasted = true)}
      autocapitalize="none"
    />

    <div class="flex gap-2">
      <a href="/scan" class="contents">
        <button type="button" class="btn !w-auto flex-grow">
          <iconify-icon icon="ph:camera-bold" width="32" />
          {$t("user.send.scan")}
        </button>
      </a>

      <button type="button" class="btn !w-auto flex-grow" on:click={paste}>
        <iconify-icon icon="ph:clipboard-text-bold" width="32" />
        {$t("user.send.paste")}
      </button>
    </div>

    <button bind:this={el} type="submit" class="btn btn-accent">
      <iconify-icon icon="ph:paper-plane-right-bold" width="32" />
      <div class="my-auto">{$t("user.send.next")}</div>
    </button>

    <a href="/send/ecash" class="block">
      <button type="button" class="btn">
        <img src="/images/cash.png" class="w-8" />
        <div class="my-auto">{$t("payments.createEcash")}</div>
      </button>
    </a>
  </form>

  {#if contacts.length}
    <div class="space-y-5">
      <h1 class="px-3 md:px-0 text-2xl font-semibold mt-10">
        {$t("user.send.contacts")}
      </h1>
      <div>
        {#each contacts as c}
          <a href={`/pay/${c.username}`}>
            <div class="border-b p-2 last:border-b-0 hover:bg-base-200">
              <div class="flex">
                <div>
                  <div class="flex">
                    <Avatar user={c} size={20} disabled={true} />
                    <div class="my-auto text-left">
                      <p class="ml-1 text-lg break-words">{c.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
