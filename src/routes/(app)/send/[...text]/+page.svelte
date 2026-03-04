<script lang="ts">
  import PhCameraBold from "virtual:icons/ph/camera-bold";
  import PhClipboardTextBold from "virtual:icons/ph/clipboard-text-bold";
  import PhPaperPlaneRightBold from "virtual:icons/ph/paper-plane-right-bold";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhPushPinFill from "virtual:icons/ph/push-pin-fill";
  import PhPushPinBold from "virtual:icons/ph/push-pin-bold";
  import PhStarFill from "virtual:icons/ph/star-fill";
  import PhStarBold from "virtual:icons/ph/star-bold";
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
    all = await fetch("/api/contacts").then((r) => r.json());
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
      await post("/api/pins/delete", { id });
    } else {
      await post("/api/pins", { id });
    }

    if (all) all = await fetch("/api/contacts").then((r) => r.json());
    invalidate("app:contacts");
  };

  let trust = async (e, { id, trusted }) => {
    e.preventDefault();
    e.stopPropagation();

    if (trusted) {
      await post("/api/trust/delete", { id });
    } else {
      await post("/api/trust", { id });
    }

    if (all) all = await fetch("/api/contacts").then((r) => r.json());
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
          <PhCameraBold width="32" />
          {$t("user.send.scan")}
        </button>
      </a>

      <button type="button" class="btn !w-auto flex-grow" onclick={paste}>
        <PhClipboardTextBold width="32" />
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
      <PhPaperPlaneRightBold width="32" />
      <div class="my-auto">{$t("user.send.next")}</div>
    </button>

    <a href="/send/fund" class="block">
      <button type="button" class="btn">
        <PhLightningFill width="24" class="text-yellow-300" />
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
                  {#if c.pinned}
    <PhPushPinFill width={32} />
  {:else}
    <PhPushPinBold width={32} />
  {/if}
                </button>
                <button
                  type="button"
                  class="ml-auto"
                  onclick={(e) => trust(e, c)}
                  aria-label={c.trusted ? "Untrust contact" : "Trust contact"}
                >
                  {#if c.trusted}
    <PhStarFill width={32} />
  {:else}
    <PhStarBold width={32} />
  {/if}
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
