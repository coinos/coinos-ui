<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { back, get, post, fail, focus } from "$lib/utils";

  let { data = $bindable(), form } = $props();
  data.subject = data.user;

  let { contacts } = $derived(data);

  let all = $state();
  let loaded = $state();
  let loadMore = async () => {
    loaded = true;
    all = await get("/contacts");
  };

  let el: any = $state(),
    text = $state(),
    pasted = $state(),
    w: number | undefined = $state();

  let keypress = (e) => (e.key === "Enter" ? e.preventDefault() || el.click() : (pasted = false));

  let paste = async () => {
    text = await navigator.clipboard.readText();
    await tick();
    pasted = true;
  };

  let pin = async (e, { id, pinned }) => {
    e.preventDefault();
    e.stopPropagation();

    if (pinned) {
      await post("/post/pins/delete", { id });
    } else {
      await post("/post/pins", { id });
    }

    if (all) all = await get("/contacts");
    invalidate("app:contacts");
  };

  let trust = async (e, { id, trusted }) => {
    e.preventDefault();
    e.stopPropagation();

    if (trusted) {
      await post("/post/trust/delete", { id });
    } else {
      await post("/post/trust", { id });
    }

    if (all) all = await get("/contacts");
    invalidate("app:contacts");
  };

  $effect(() => {
    if (browser && pasted && text) el.click() && (pasted = false);
  });
</script>

<svelte:window bind:innerWidth={w} />

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">{$t("payments.send")}</h1>

  <form method="POST" use:enhance class="space-y-2 text-xl">
    {#if form?.error}
      <div class="mb-5">
        <div class="text-red-600">
          {form.error === "default" ? $t("error.unrecognizedInput") : form.error}
        </div>
      </div>
    {/if}

    <div class="flex gap-2">
      <a href="/scan" class="contents">
        <button type="button" class="btn !w-auto flex-grow">
          <iconify-icon noobserver icon="ph:camera-bold" width="32"></iconify-icon>
          {$t("user.send.scan")}
        </button>
      </a>

      <button type="button" class="btn !w-auto flex-grow" onclick={paste}>
        <iconify-icon noobserver icon="ph:clipboard-text-bold" width="32"></iconify-icon>
        {$t("user.send.paste")}
      </button>
    </div>

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

    <button bind:this={el} type="submit" class="btn btn-accent">
      <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"></iconify-icon>
      <div class="my-auto">{$t("user.send.next")}</div>
    </button>

    <a href="/send/fund" class="block">
      <button type="button" class="btn">
        <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300 text-2xl"
        ></iconify-icon>
        <div class="my-auto">{$t("payments.createFund")}</div>
      </button>
    </a>
  </form>

  {#if contacts.length}
    <div class="space-y-5">
      <h1 class="px-3 md:px-0 text-2xl font-semibold mt-10">{$t("user.send.contacts")}</h1>
      <div>
        {#each all || contacts as c, i}
          <a href={`/pay/${c.username}`} class="contents">
            <div class="flex hover:bg-base-200 p-2">
              <Avatar user={c} size={20} disabled={true} />
              <div class="my-auto text-left">
                <p class="ml-1 text-lg break-words">{c.username}</p>
              </div>
              <div class="flex ml-auto gap-1">
                <button
                  type="button"
                  onclick={(e) => pin(e, c)}
                  aria-label={c.pinned ? "Unpin contact" : "Pin contact"}
                >
                  <iconify-icon
                    icon={c.pinned ? "ph:push-pin-fill" : "ph:push-pin-bold"}
                    width={32}
                  ></iconify-icon>
                </button>
                <button
                  type="button"
                  class="ml-auto"
                  onclick={(e) => trust(e, c)}
                  aria-label={c.trusted ? "Untrust contact" : "Trust contact"}
                >
                  <iconify-icon icon={c.trusted ? "ph:star-fill" : "ph:star-bold"} width={32}
                  ></iconify-icon>
                </button>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  {#if !loaded && contacts.length > 0}
    <button onclick={loadMore} type="button" class="btn">{$t("user.loadMore")}</button>
  {/if}
</div>
