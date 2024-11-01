<script>
  import { focus } from "$lib/utils";
  import { goto } from "$app/navigation";
  import Icon from "$comp/Icon.svelte";
  import Image from "$comp/Image.svelte";
  import { t } from "$lib/translations";
</script>

<div class="mt-[96.88px] md:mt-0">
  <div class="space-y-10">
    <h1
      class="text-5xl md:text-6xl lg:text-7xl font-medium text-center w-full md:w-3/4 lg:w-1/2 max-w-7xl mx-auto leading-tight"
    >
      {$t("landing.header_before_icon")}
      <span class="relative">
        {$t("landing.header_with_icon")}
        <Icon
          icon="rays"
          style="absolute -top-16 left-5 md:left-8 lg:left-14 2xl:left-24"
        />
      </span>
      {$t("landing.header_after_icon")}
    </h1>
    <h2
      class="text-center text-secondary w-full md:w-3/5 lg:w-2/5 max-w-3xl mx-auto text-xl leading-normal font-medium"
    >
      {$t("landing.subheader")}
    </h2>

    <div class="flex justify-center">
      <a href="/register">
        <button
          use:focus
          class="bg-black text-white border rounded-full px-6 py-2 font-bold hover:opacity-80"
        >
          {$t("nav.startInSeconds")}
        </button>
      </a>
    </div>
  </div>

  <Image image="hero-image" style="w-full md:w-2/3 max-w-5xl mx-auto mt-20" />
</div>
