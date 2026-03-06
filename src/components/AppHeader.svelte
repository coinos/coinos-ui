<script lang="ts">
  import PhHouseBold from "virtual:icons/ph/house-bold";
  import { banner, theme, newPayment } from "$lib/store";
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import Menu from "$comp/Menu.svelte";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  let { user, subject = $bindable() } = $props();

  let w: number = $state(globalThis.innerWidth || 1024);
  $effect(() => (subject = subject || user));

  let bg = $derived(
    ($banner as any)?.id && ($banner as any).id === subject?.id
      ? `url(${($banner as any).src})`
      : subject?.banner
        ? subject.banner.includes(":")
          ? `url(${subject.banner})`
          : `url(/api/public/${subject.banner}.webp)`
        : undefined,
  );

  let isHome = $derived($page.url.pathname === `/${user?.username}`);

  const links = $derived(!isHome
    ? [
        {
          href: `/${user?.username}`,
          icon: PhHouseBold,
          label: "Home",
        },
      ]
    : [
    // {
    //   href: `/scan`,
    //   icon: "ph:camera-bold",
    //   label: "Scan",
    // },
    // {
    //   href: `/${user?.username}/receive`,
    //   icon: "ph:hand-coins-bold",
    //   flip: "horizontal",
    //   label: "Receive",
    // },
    // {
    //   href: `/payments`,
    //   icon: "ph:clock-bold",
    //   label: "Payments",
    // },
    // {
    //   href: `/send`,
    //   icon: "ph:paper-plane-right-bold",
    //   label: "Send",
    // },
    // {
    //   href: `/logout`,
    //   icon: "ph:sign-out-bold",
    //   label: "Logout",
    // },
  ]);

  let opacity = $derived((href) =>
    $page.url.pathname === href ? "opacity-100" : "opacity-90 hover:opacity-none",
  );
</script>

<svelte:window bind:innerWidth={w} />

  <header
    class="bg-gradient-to-r bg-primary bg-accent h-[175px] w-full relative bg-cover mb-20 !z-30"
    style:background-image={bg}
  >
    <nav class="flex justify-end items-center space-x-4 p-5">
      {#if user}
        {#each links as { href, icon: Icon, label }}
          <a {href} data-sveltekit-preload-data="tap" aria-label={label}>
            <button class="flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl {opacity(href)}" aria-label={label}>
              <Icon width={w > 640 ? 32 : 24} />
            </button>
          </a>
        {/each}
        <Menu {opacity} {user} t={$t} {w} />
      {:else}
        <a href={`/login?redirect=${$page.url.pathname}`}>
          <button class="btn !rounded-full">{$t("nav.signIn")}</button>
        </a>
      {/if}
    </nav>
    {#if subject || user}
      <div
        class="absolute md:w-[64px] md:mx-auto lg:left-[154px] xl:left-[194px] left-[calc(50vw-64px)] -bottom-[64px] z-30"
      >
        <Avatar user={subject || user} />
      </div>
    {/if}
  </header>

<style>
  header {
    z-index: 50;
    view-transition-name: header;
  }
</style>
