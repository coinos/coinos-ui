<script lang="ts">
  import PhListBold from "virtual:icons/ph/list-bold";
  import PhFadersBold from "virtual:icons/ph/faders-bold";
  import PhLifebuoyBold from "virtual:icons/ph/lifebuoy-bold";
  import PhMapTrifoldBold from "virtual:icons/ph/map-trifold-bold";
  import PhChatBold from "virtual:icons/ph/chat-bold";
  import PhMoonStarsBold from "virtual:icons/ph/moon-stars-bold";
  import PhSignOutBold from "virtual:icons/ph/sign-out-bold";
  import CoinosLogo from "virtual:icons/coinos/logo";
  import { theme } from "$lib/store";
  import DarkToggle from "$comp/DarkToggle.svelte";
  import { OutClick } from "svelte-outclick";
  let { t, user, w, opacity } = $props();

  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
  let showMenu = $state(false);

  let menuButtons = [
    { key: "nav.settings", icon: PhFadersBold, href: `/settings` },
    { key: "nav.support", icon: PhLifebuoyBold, href: `/support` },
    { key: "nav.map", icon: PhMapTrifoldBold, href: `/map` },
    { key: "nav.dm", icon: PhChatBold, href: `/messages` },
    { key: "nav.dark", icon: PhMoonStarsBold, href: `/dark` },
    { key: "nav.signOut", icon: PhSignOutBold, href: `/logout` },
  ];

  let hideMenu = () => (showMenu = false);
  let toggleMenu = () => (showMenu = !showMenu);
</script>

<div>
  <OutClick onOutClick={hideMenu}>
    <button class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl {opacity('/support')}" onclick={toggleMenu} aria-label="Open menu">
      <PhListBold width={w > 640 ? 32 : 24} />
    </button>

    <div
      class="absolute top-14 right-0 bg-base-100 rounded-3xl p-8 shadow-xl z-50"
      class:hidden={!showMenu}
      class:block={showMenu}
    >
      <ul class="space-y-5 w-48">
        {#each menuButtons as { href, icon: Icon, key }}
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
                  <Icon width="32" />
                  {t(key)}
                </button>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
      <hr class="my-4" />
      <a href="/?stay=true" aria-label="Coinos home">
        <CoinosLogo width="160" />
      </a>
    </div>
  </OutClick>
</div>

