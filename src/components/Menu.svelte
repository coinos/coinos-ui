<script>
  import { theme } from "$lib/store";
  import OutClick from "svelte-outclick";
  export let t, user, w, opacity;

  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
  let showMenu = false;

  let menuButtons;
  $: if (user)
    menuButtons = [
      { key: "nav.settings", icon: "ph:gear-bold", href: `/settings` },
      { key: "nav.support", icon: "ph:lifebuoy-bold", href: `/support` },
      { key: "nav.map", icon: "ph:map-trifold-bold", href: `/map` },
      {
        key: "nav.merch",
        icon: "ph:storefront-bold",
        href: `https://coinosmerch.com`,
      },
      { key: "nav.dark", icon: "ph:moon-stars-bold", href: `/dark` },
      { key: "nav.signOut", icon: "ph:sign-out-bold", href: `/logout` },
    ];

  let hideMenu = () => (showMenu = false);
  let toggleMenu = () => (showMenu = !showMenu);
</script>

<div>
  <OutClick on:outclick={hideMenu}>
    <button class="btn-menu {opacity('/support')}" on:click={toggleMenu}
      ><iconify-icon icon="ph:list-bold" width={w > 640 ? 32 : 24} />
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
              <button
                class="flex justify-center items-center font-semibold hover:opacity-80 gap-2"
                on:click={dark}
              >
                <iconify-icon
                  icon={$theme === "dark"
                    ? "ph:sun-bold"
                    : "ph:moon-stars-bold"}
                  width="32"
                />
                {t(`nav.${$theme === "dark" ? "light" : "dark"}`)}
              </button>
            {:else}
              <a
                {href}
                data-sveltekit-preload-code="eager"
                data-sveltekit-preload-data="false"
                on:click={hideMenu}
              >
                <button
                  class="flex justify-center items-center font-semibold hover:opacity-80 gap-2"
                >
                  <iconify-icon {icon} width="32" />
                  {t(key)}
                </button>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
      <hr class="my-4" />
      <a href="/?stay=true"><iconify-icon icon="coinos:logo" width="130" /></a>
    </div>
  </OutClick>
</div>

<style>
  .btn-menu {
    @apply flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl;
  }
</style>
