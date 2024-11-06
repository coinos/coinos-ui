<script>
  import { t } from "$lib/translations";
  import { theme } from "$lib/store";
  let dark = () => ($theme = $theme === "dark" ? "light" : "dark");
</script>

<button
  class="flex justify-center items-center hover:opacity-80 gap-2 font-bold"
  on:click={dark}
>
  <iconify-icon
    icon={$theme === "dark" ? "ph:sun-bold" : "ph:moon-stars-bold"}
    width="30"
  />

  {$t(`nav.${$theme === "dark" ? "light" : "dark"}`)}
</button>
