<script lang="ts">
  import PhSunBold from "virtual:icons/ph/sun-bold";
  import PhMoonStarsBold from "virtual:icons/ph/moon-stars-bold";
  import { t } from "$lib/translations";
  import { theme } from "$lib/store";
  let dark = () => {
    $theme = $theme === "dark" ? "light" : "dark";
    document.cookie = `theme=${$theme}; path=/; max-age=21000000`;
  };
</script>

<button class="flex justify-center items-center hover:opacity-80 gap-2 font-bold whitespace-nowrap" onclick={dark}>
  {#if $theme === "dark"}
    <PhSunBold width="30" />
  {:else}
    <PhMoonStarsBold width="30" />
  {/if}

  {$t(`nav.${$theme === "dark" ? "light" : "dark"}`)}
</button>
