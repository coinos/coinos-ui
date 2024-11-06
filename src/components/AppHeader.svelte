<script>
  import OutClick from "svelte-outclick";
  import { banner, theme, newPayment } from "$lib/store";
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import { loading, t } from "$lib/translations";
  import { page } from "$app/stores";

  export let user, subject;

  $: if (!subject) subject = user;

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

  let showMenu = false;

  $: bg =
    $banner?.id && $banner.id === subject.id
      ? `url(${$banner.src})`
      : subject?.banner
        ? subject.banner.includes(":")
          ? `url(${subject.banner})`
          : `url(/api/public/${subject.banner}.webp)`
        : undefined;

  $: $page && (showMenu = false);

  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
</script>

{#if !$loading}
  <header
    class="bg-gradient-to-r from-primary to-gradient h-[175px] w-full relative bg-cover mb-20"
    style:background-image={bg}
  >
    <nav class="flex justify-end items-center space-x-4 p-5">
      {#if user}
        <a href={`/${user.username}`} data-sveltekit-preload-code="eager">
          <button
            class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl border border-black/10 {$page
              .url.pathname === `/${user.username}`
              ? 'opacity-100'
              : 'opacity-70 hover:opacity-80'}"
          >
            <iconify-icon icon="ph:house-bold" width="24" />
          </button>
        </a>
        <a href={`/${user.username}/receive`}>
          <button
            class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl border border-black/10 {$page.url.pathname.includes(
              'invoice',
            )
              ? 'opacity-100'
              : 'opacity-70 hover:opacity-80'}"
          >
            <iconify-icon
              icon="ph:hand-coins-bold"
              flip="horizontal"
              width="24"
            />
          </button>
        </a>
        <a href={`/payments`} data-sveltekit-preload-code="eager">
          <button
            class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl border border-black/10 {$page
              .url.pathname === `/payments`
              ? 'opacity-100'
              : 'opacity-70 hover:opacity-80'} relative"
            ><iconify-icon icon="ph:clock-bold" width="24" />
            {#if $newPayment}
              <span class="absolute top-0 right-0">
                <span class="flex h-3 w-3">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"
                  />
                  <span
                    class="relative inline-flex rounded-full h-3 w-3 bg-[#F7931A]"
                  />
                </span>
              </span>
            {/if}
          </button>
        </a>
        <a href={`/send`} data-sveltekit-preload-code="eager">
          <button
            class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl border border-black/10 {$page
              .url.pathname === `/send`
              ? 'opacity-100'
              : 'opacity-70 hover:opacity-80'}"
            ><iconify-icon icon="ph:paper-plane-right-bold" width="24" />
          </button>
        </a>
        <div class="relative">
          <OutClick on:outclick={() => (showMenu = false)}>
            <button
              class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl border border-black/10 {$page
                .url.pathname === `/settings` ||
              $page.url.pathname === `/support`
                ? 'opacity-100'
                : `opacity-70 hover:opacity-80 ${
                    showMenu ? 'opacity-80' : ''
                  }`}"
              on:click={() => (showMenu = !showMenu)}
              ><iconify-icon icon="ph:list-bold" width="24" />
            </button>

            <div
              class="{showMenu
                ? 'block'
                : 'hidden'} absolute top-14 right-0 bg-base-100 rounded-3xl p-8 shadow-xl z-50"
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
                        {$t(`nav.${$theme === "dark" ? "light" : "dark"}`)}
                      </button>
                    {:else}
                      <a
                        {href}
                        data-sveltekit-preload-code="eager"
                        data-sveltekit-preload-data="false"
                      >
                        <button
                          class="flex justify-center items-center font-semibold hover:opacity-80 gap-2"
                        >
                          <iconify-icon {icon} width="32" />
                          {$t(key)}
                        </button>
                      </a>
                    {/if}
                  </li>
                {/each}
              </ul>
              <hr class="my-4" />
              <a href="/?stay=true"
                ><iconify-icon icon="coinos:logo" width="130" /></a
              >
            </div>
          </OutClick>
        </div>
      {:else}
        <a href={`/login?redirect=${$page.url.pathname}`}>
          <button class="btn !rounded-full">{$t("nav.signIn")}</button>
        </a>
      {/if}
    </nav>
    {#if subject}
      <div
        class="absolute md:w-[64px] md:mx-auto lg:left-[154px] xl:left-[194px] left-[calc(50vw-64px)] -bottom-[64px] z-30"
      >
        <Avatar user={subject} />
      </div>
    {/if}
  </header>
{/if}

<style>
  header {
    z-index: 50;
    view-transition-name: header;
  }
</style>
