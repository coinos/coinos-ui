<script>
  import { goto } from "$app/navigation";
  import { scroll } from "$lib/utils";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  import DarkToggle from "$comp/DarkToggle.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";

  export let howItWorks;
  export let faq;
  export let about;
  export let user;

  let showMobileMenu = false;
  let header;
  const mobileMenuButtonClick = (section) => {
    showMobileMenu = false;
    scroll(section);
  };
</script>

<header
  class="w-full lg:w-5/6 p-4 mx-auto fixed sticky z-10 top-0 bg-base-100"
  bind:this={header}
>
  <nav class="block lg:flex justify-between items-center">
    <div class="flex justify-start lg:justify-center items-center lg:space-x-5">
      <a href="/" on:click={() => scroll(header)}>
        <iconify-icon icon="coinos:logo" width="224" />
      </a>
    </div>

    <!-- desktop nav -->
    <div class="hidden space-x-5 lg:flex justify-center items-center font-bold">
      {#if $page.url.pathname === "/"}
        <button class="hover:opacity-80" on:click={() => scroll(howItWorks)}
          >{$t("howItWorks.header")}</button
        >
        <button class="hover:opacity-80" on:click={() => scroll(faq)}
          >{$t("faq.header")}</button
        >
        <button class="hover:opacity-80" on:click={() => scroll(about)}
          >{$t("about.header")}</button
        >
      {/if}
      {#if user}
        <button
          class="btn !w-auto !rounded-full"
          on:click={() => goto(`/${user.username}`)}
          >Home
        </button>
        <button
          class="btn !w-auto !rounded-full"
          on:click={() => goto("/logout")}
        >
          {$t("nav.signOut")}
        </button>
      {:else}
        <button
          class="btn btn-accent !w-auto !rounded-full"
          on:click={() => goto("/register")}
          >{$t("nav.register")}
        </button>
        <button
          class="btn !w-auto !rounded-full"
          on:click={() => goto("/login")}
        >
          {$t("nav.signIn")}
        </button>
      {/if}
    </div>

    <button
      class="block lg:hidden absolute top-[34.5px] right-10 z"
      on:click={() => (showMobileMenu = !showMobileMenu)}
    >
      <iconify-icon
        icon={!showMobileMenu ? "ph:list-bold" : "ph:x-bold"}
        width="32"
      />
    </button>

    <div
      class="container w-full p-10 lg:hidden absolute top-0 {showMobileMenu
        ? 'right-0'
        : 'right-[-100%]'} transition-all ease-in-out duration-300 h-[100vh] w-full bg-base-100"
    >
      <div class="space-y-5 mt-24 font-bold text-xl">
        <LocaleSelector />
        <DarkToggle />
        <button on:click={() => mobileMenuButtonClick(howItWorks)} class="block"
          >{$t("howItWorks.header")}</button
        >
        <button on:click={() => mobileMenuButtonClick(faq)} class="block"
          >{$t("faq.header")}</button
        >
        <button on:click={() => mobileMenuButtonClick(about)} class="block"
          >{$t("about.header")}</button
        >
        {#if !user}
          <button class="btn btn-accent" on:click={() => goto("/register")}
            >{$t("nav.register")}
          </button>
          <button class="btn" on:click={() => goto("/login")}>
            {$t("nav.signIn")}
          </button>
        {:else}
          <button
            class="border rounded-full px-6 py-2 font-bold block"
            on:click={() => goto(`/${user.username}`)}
            >{$t("nav.account")}
          </button>
          <button
            class="bg-primary text-white border rounded-full px-6 py-2 font-bold block"
            on:click={() => goto("/logout")}
          >
            {$t("nav.signOut")}
          </button>
        {/if}
      </div>
    </div>
  </nav>
</header>

<style>
  .z {
    z-index: 100;
  }
</style>
