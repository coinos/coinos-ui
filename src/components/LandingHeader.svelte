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
  }: any = $props();

  function startNow() {
    const match = document.cookie.match(/(?:^|;\s*)username=([^;]*)/);
    goto(match ? `/${decodeURIComponent(match[1])}` : "/login");
  }

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
        <button class="btn btn-accent !w-auto !rounded-full" onclick={startNow}>
          {$t("nav.startInSeconds")}
        </button>
      {/if}
    </div>

  </nav>
</header>
