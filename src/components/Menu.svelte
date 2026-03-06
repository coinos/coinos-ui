<script lang="ts">
  import PhListBold from "virtual:icons/ph/list-bold";
  import PhFadersBold from "virtual:icons/ph/faders-bold";
  import PhLifebuoyBold from "virtual:icons/ph/lifebuoy-bold";
  import PhMapTrifoldBold from "virtual:icons/ph/map-trifold-bold";
  import PhChatBold from "virtual:icons/ph/chat-bold";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhMoonStarsBold from "virtual:icons/ph/moon-stars-bold";
  import PhSignOutBold from "virtual:icons/ph/sign-out-bold";
  import CoinosLogo from "virtual:icons/coinos/logo";
  import { theme, unreadDMs } from "$lib/store";
  import DarkToggle from "$comp/DarkToggle.svelte";
  let { t, user, w, opacity } = $props();

  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
  let showMenu = $state(false);

  let menuButtons = [
    { key: "nav.settings", icon: PhFadersBold, href: `/settings` },
    { key: "nav.support", icon: PhLifebuoyBold, href: `/support` },
    { key: "nav.map", icon: PhMapTrifoldBold, href: `/map` },
    { key: "nav.dm", icon: PhChatBold, href: `/messages` },
    { key: "nav.funds", icon: PhLightningFill, href: `/funds` },
    { key: "nav.dark", icon: PhMoonStarsBold, href: `/dark` },
    { key: "nav.signOut", icon: PhSignOutBold, href: `/logout` },
  ];

  let hideMenu = () => (showMenu = false);
  let toggleMenu = () => (showMenu = !showMenu);

  const clickOutside = (node, callback) => {
    const handler = (e) => { if (!node.contains(e.target)) callback(); };
    document.addEventListener("click", handler, true);
    return { destroy: () => document.removeEventListener("click", handler, true) };
  };
</script>

<div use:clickOutside={hideMenu}>
  <button class="relative flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl {opacity('/support')}" onclick={toggleMenu} aria-label="Open menu">
    <PhListBold width={w > 640 ? 32 : 24} />
    {#if $unreadDMs > 0}
      <span class="badge-dot">{$unreadDMs > 99 ? "99+" : $unreadDMs}</span>
    {/if}
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
              data-sveltekit-preload-data="tap"
              onclick={hideMenu}
            >
              <button
                class="relative flex justify-center items-center font-semibold hover:opacity-80 gap-2"
              >
                <Icon width="32" />
                {t(key)}
                {#if key === "nav.dm" && $unreadDMs > 0}
                  <span class="badge-dot">{$unreadDMs > 99 ? "99+" : $unreadDMs}</span>
                {/if}
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
</div>

<style>
  .badge-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 9px;
    background: #f97316;
    color: white;
    font-size: 11px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
  }
</style>
