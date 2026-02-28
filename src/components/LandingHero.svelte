<script lang="ts">
  import { focus } from "$lib/utils";
  import { goto } from "$app/navigation";
  import Image from "$comp/Image.svelte";
  import { t } from "$lib/translations";
</script>

<div class="pt-16 md:mt-0">
  <div class="space-y-5">
    <h1
      class="text-4xl md:text-6xl lg:text-7xl font-medium text-center w-full md:w-3/4 lg:w-1/2 max-w-7xl mx-auto"
    >
      {$t("landing.header_before_icon")}
      <span class="relative inline-block">
        {$t("landing.header_with_icon")}
        <iconify-icon
          noobserver
          icon="coinos:rays"
          class="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2"
        ></iconify-icon>
      </span>
      {$t("landing.header_after_icon")}
    </h1>
    <h2
      class="text-center text-secondary w-full md:w-3/5 lg:w-2/5 max-w-3xl mx-auto text-xl leading-normal font-medium"
    >
      {$t("landing.subheader")}
    </h2>

    <div class="text-center">
      <a href="/register">
        <button
          use:focus
          class="btn !rounded-full bg-primary text-primary-content hover:bg-primary/80 !w-auto px-12 text-xl start-btn"
        >
          {$t("nav.startInSeconds")}
        </button>
      </a>
    </div>
  </div>

  <Image image="hero-image" style="w-full md:w-2/3 max-w-5xl mx-auto mt-20" />
</div>

<style>
  :global([data-theme="black"]) .start-btn {
    background: white;
    color: black;
  }
  :global([data-theme="black"]) .start-btn:hover {
    background: rgba(255, 255, 255, 0.85);
  }
</style>
