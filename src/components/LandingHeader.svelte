<script lang="ts">
  import CoinosLogo from "virtual:icons/coinos/logo";
  import { goto } from "$app/navigation";
  import { scroll } from "$lib/utils";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  let {
    howItWorks = undefined,
    faq = undefined,
    about = undefined,
    user = undefined,
  }: any = $props();

  let header = $state();
</script>

<header class="w-full lg:w-5/6 p-4 mx-auto fixed sticky z-10 top-0 bg-base-100" bind:this={header}>
  <nav class="block lg:flex justify-between items-center">
    <div class="flex justify-start lg:justify-center items-center lg:space-x-5">
      <a href="/" onclick={() => scroll(header)} aria-label="Home">
        <CoinosLogo width="224" />
      </a>
    </div>

    <!-- desktop nav -->
    <div class="hidden space-x-5 lg:flex justify-center items-center font-bold">
      {#if $page.url.pathname === "/"}
        <button class="hover:opacity-80" onclick={() => scroll(howItWorks)}>
          {$t("howItWorks.header")}
        </button>
        <button class="hover:opacity-80" onclick={() => scroll(faq)}>{$t("faq.header")}</button>
        <button class="hover:opacity-80" onclick={() => scroll(about)}>{$t("about.header")}</button>
      {/if}
      {#if user}
        <button class="btn !w-auto !rounded-full" onclick={() => goto(`/${user.username}`)}>
          {$t("nav.home")}
        </button>
        <button class="btn !w-auto !rounded-full" onclick={() => goto("/logout")}>
          {$t("nav.signOut")}
        </button>
      {:else}
        <button class="btn btn-accent !w-auto !rounded-full" onclick={() => goto("/register")}>
          {$t("nav.register")}
        </button>
        <button class="btn !w-auto !rounded-full" onclick={() => goto("/login")}>
          {$t("nav.signIn")}
        </button>
      {/if}
    </div>

  </nav>
</header>
