<script>
  import { t } from "$lib/translations";
</script>

<div>
  <h3 class="text-5xl font-medium mb-5 text-center">
    {$t("about.locations.header")}
  </h3>
  <p
    class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10"
  >
    {@html $t("about.locations.description")}
  </p>

  <div class="relative">
    <a href="/map" class="contents">
      <img src="/map.png" class="mx-auto" alt="Map" />
    </a>

    <a href="/map" class="contents">
      <button
        class="bg-black text-white border border-4 rounded-full px-6 py-2 font-bold hover:bg-secondary absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
      >
        {$t("about.locations.viewMap")}
      </button>
    </a>
  </div>
</div>
