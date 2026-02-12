<script lang="ts">
  import { theme } from "$lib/store";
  import DarkToggle from "$comp/DarkToggle.svelte";
  import { OutClick } from "svelte-outclick";
  let { t, user, w, opacity } = $props();

  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
  let showMenu = $state(false);

  let menuButtons = [
    { key: "nav.settings", icon: "ph:gear-bold", href: `/settings` },
    { key: "nav.support", icon: "ph:lifebuoy-bold", href: `/support` },
    { key: "nav.map", icon: "ph:map-trifold-bold", href: `/map` },
    // {
    //   key: "nav.merch",
    //   icon: "ph:storefront-bold",
    //   href: `https://coinosmerch.com`,
    // },
    { key: "nav.dm", icon: "ph:chat-bold", href: `/dm` },
    { key: "nav.dark", icon: "ph:moon-stars-bold", href: `/dark` },
    { key: "nav.signOut", icon: "ph:sign-out-bold", href: `/logout` },
  ];

  let hideMenu = () => (showMenu = false);
  let toggleMenu = () => (showMenu = !showMenu);
</script>

<div>
  <OutClick onOutClick={hideMenu}>
    <button
      class="btn-menu {opacity('/support')}"
      onclick={toggleMenu}
      aria-label="Open menu"
    >
      <iconify-icon noobserver icon="ph:list-bold" width={w > 640 ? 32 : 24}
      ></iconify-icon>
    </button>

    <div
      class="absolute top-14 right-0 bg-base-100 rounded-3xl p-8 shadow-xl z-50"
      class:hidden={!showMenu}
      class:block={showMenu}
    >
      <ul class="space-y-5 w-48">
        {#each menuButtons as { href, icon, key }}
          <li>
            {#if key.includes("dark")}
              <DarkToggle />
            {:else}
              <a
                {href}
                data-sveltekit-preload-code="eager"
                data-sveltekit-preload-data="false"
                onclick={hideMenu}
              >
                <button
                  class="flex justify-center items-center font-semibold hover:opacity-80 gap-2"
                >
                  <iconify-icon noobserver {icon} width="32"></iconify-icon>
                  {t(key)}
                </button>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
      <hr class="my-4" />
      <a href="/?stay=true" aria-label="Coinos home"
        ><iconify-icon noobserver icon="coinos:logo" width="160"
        ></iconify-icon></a
      >
    </div>
  </OutClick>
</div>

<style>
  @reference "../app.css";

  .btn-menu {
    @apply flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl;
  }
</style>
