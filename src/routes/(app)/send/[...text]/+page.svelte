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
  import { back, get, fail, focus } from "$lib/utils";

  let { data = $bindable(), form } = $props();
  data.subject = data.user;

  let { contacts } = $state(data);

  let loaded = $state();
  let loadMore = async () => {
    loaded = true;
    contacts = await get("/contacts");
  };

  let el = $state(),
    text = $state(),
    pasted = $state(),
    w = $state();

  let keypress = (e) =>
    e.key === "Enter" ? e.preventDefault() || el.click() : (pasted = false);

  let paste = async () => {
    text = await navigator.clipboard.readText();
    await tick();
    pasted = true;
  };

  $effect(() => {
    if (browser && pasted && text) el.click() && (pasted = false);
  });
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
      onkeypress={keypress}
      class="w-full p-4 border rounded-xl h-32 text-xl"
      bind:value={text}
      onpaste={() => (pasted = true)}
      autocapitalize="none"
    ></textarea>

    <div class="flex gap-2">
      <a href="/scan" class="contents">
        <button type="button" class="btn !w-auto flex-grow">
          <iconify-icon icon="ph:camera-bold" width="32"></iconify-icon>
          {$t("user.send.scan")}
        </button>
      </a>

      <button type="button" class="btn !w-auto flex-grow" onclick={paste}>
        <iconify-icon icon="ph:clipboard-text-bold" width="32"></iconify-icon>
        {$t("user.send.paste")}
      </button>
    </div>

    <button bind:this={el} type="submit" class="btn btn-accent">
      <iconify-icon icon="ph:paper-plane-right-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("user.send.next")}</div>
    </button>

    <a href="/send/ecash" class="block">
      <button type="button" class="btn">
        <img src="/images/cash.png" class="w-8" />
        <div class="my-auto">{$t("payments.createEcash")}</div>
      </button>
    </a>

    <a href="/send/fund" class="block">
      <button type="button" class="btn">
        <iconify-icon icon="ph:lightning-fill" class="text-yellow-300 text-2xl"
        ></iconify-icon>
        <div class="my-auto">{$t("payments.createFund")}</div>
      </button>
    </a>
  </form>

  {#if contacts.length}
    <div class="space-y-5">
      <h1 class="px-3 md:px-0 text-2xl font-semibold mt-10">
        {$t("user.send.contacts")}
      </h1>
      <div>
        {#each contacts as c, i}
          <a href={`/pay/${c.username}`} class="contents">
            <div class="flex hover:bg-base-200 p-2">
              <Avatar user={c} size={20} disabled={true} />
              <div class="my-auto text-left">
                <p class="ml-1 text-lg break-words">{c.username}</p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  {#if !loaded}
    <button onclick={loadMore} type="button" class="btn"
      >{$t("user.loadMore")}</button
    >
  {/if}
</div>
