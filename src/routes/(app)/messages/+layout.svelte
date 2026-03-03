<script lang="ts">
  import PhArrowLeftBold from "virtual:icons/ph/arrow-left-bold";
  import PhHouseBold from "virtual:icons/ph/house-bold";
  import { onMount, onDestroy } from "svelte";
  import Menu from "$comp/Menu.svelte";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  let { data, children } = $props();
  let user = $derived(data.user);

  let w: number | undefined = $state();
  let isDetail = $derived($page.params.pubkey);

  let opacity = $derived((href: string) =>
    $page.url.pathname === href ? "opacity-100" : "opacity-90 hover:opacity-none",
  );

  let header: HTMLElement | null = null;

  onMount(() => {
    header = document.querySelector("main > header");
    if (header) header.style.display = "none";
  });

  onDestroy(() => {
    if (header) header.style.display = "";
  });
</script>

<svelte:window bind:innerWidth={w} />

<div class="messages-layout">
  <nav class="flex items-center p-4 gap-4 shrink-0">
    {#if isDetail}
      <a href="/messages" class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl" aria-label="Back">
        <PhArrowLeftBold width={(w ?? 0) > 640 ? 32 : 24} />
      </a>
    {/if}

    <div class="ml-auto flex items-center gap-4">
      <a href="/{user?.username}" data-sveltekit-preload-code="eager" aria-label="Home">
        <button class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl" aria-label="Home">
          <PhHouseBold width={(w ?? 0) > 640 ? 32 : 24} />
        </button>
      </a>
      <Menu {opacity} {user} t={$t} {w} />
    </div>
  </nav>

  <div class="flex-1 min-h-0">
    {@render children?.()}
  </div>
</div>

<style>
  .messages-layout {
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }
</style>
