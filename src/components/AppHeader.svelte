<script>
  import { banner, theme, newPayment } from "$lib/store";
  import { goto } from "$app/navigation";
  import Avatar from "$comp/Avatar.svelte";
  import Menu from "$comp/Menu.svelte";
  import { loading, t } from "$lib/translations";
  import { page } from "$app/stores";

  let { user, subject = $bindable() } = $props();

  let w = $state();
  $effect(() => (subject = subject || user));

  let bg = $derived(
    $banner?.id && $banner.id === subject?.id
      ? `url(${$banner.src})`
      : subject?.banner
        ? subject.banner.includes(":")
          ? `url(${subject.banner})`
          : `url(/api/public/${subject.banner}.webp)`
        : undefined,
  );

  const links = $derived([
    // {
    //   href: `/${user?.username}`,
    //   icon: "ph:house-bold",
    //   label: "Home",
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
    $page.url.pathname === href
      ? "opacity-100"
      : "opacity-90 hover:opacity-none",
  );
</script>

<svelte:window bind:innerWidth={w} />

{#if !$loading}
  <header
    class="bg-gradient-to-r bg-primary bg-accent h-[175px] w-full relative bg-cover mb-20 !z-30"
    style:background-image={bg}
  >
    <nav class="flex justify-end items-center space-x-4 p-5">
      {#if user}
        {#each links as { href, icon, flip, label }}
          <a {href} data-sveltekit-preload-code="eager" aria-label={label}>
            <button class="btn-menu {opacity(href)}" aria-label={label}>
              <iconify-icon noobserver {icon} width={w > 640 ? 32 : 24} {flip}
              ></iconify-icon>
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
  @reference "../app.css";

  .btn-menu {
    @apply flex justify-center items-center bg-base-100 p-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl;
  }

  header {
    z-index: 50;
    view-transition-name: header;
  }
</style>
