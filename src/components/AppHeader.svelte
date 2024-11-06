<script>
  import { banner, theme, newPayment } from "$lib/store";
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import Menu from "$comp/Menu.svelte";
  import { loading, t } from "$lib/translations";
  import { page } from "$app/stores";

  export let user, subject;

  let w;
  $: if (!subject) subject = user;

  let showMenu = false;

  $: bg =
    $banner?.id && $banner.id === subject.id
      ? `url(${$banner.src})`
      : subject?.banner
        ? subject.banner.includes(":")
          ? `url(${subject.banner})`
          : `url(/api/public/${subject.banner}.webp)`
        : undefined;

  const links = [
    {
      href: `/${user.username}`,
      icon: "ph:house-bold",
    },
    {
      href: `/${user.username}/receive`,
      icon: "ph:hand-coins-bold",
      flip: "horizontal",
    },
    {
      href: `/payments`,
      icon: "ph:clock-bold",
    },
    {
      href: `/send`,
      icon: "ph:paper-plane-right-bold",
    },
  ];

  $: opacity = (href) =>
    $page.url.pathname === href
      ? "opacity-100"
      : "opacity-90 hover:opacity-none";
</script>

<svelte:window bind:innerWidth={w} />

{#if !$loading}
  <header
    class="bg-gradient-to-r bg-primary bg-accent h-[175px] w-full relative bg-cover mb-20"
    style:background-image={bg}
  >
    <nav class="flex justify-end items-center space-x-4 p-5">
      {#if user}
        {#each links as { href, icon, flip }}
          <a {href} data-sveltekit-preload-code="eager">
            <button class="btn-menu {opacity(href)}">
              <iconify-icon {icon} width={w > 640 ? 32 : 24} {flip} />
            </button>
          </a>
        {/each}
        <Menu bind:showMenu {w} {user} t={$t} {opacity} />
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
  .btn-menu {
    @apply flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl;
  }

  header {
    z-index: 50;
    view-transition-name: header;
  }
</style>
