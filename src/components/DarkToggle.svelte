<script>
  import { t } from "$lib/translations";
  import { theme } from "$lib/store";
  let dark = () => {
    $theme = $theme === "dark" ? "light" : "dark";
    document.cookie = `theme=${$theme}; path=/; max-age=86400`;
  };
</script>

<button
  class="flex justify-center items-center hover:opacity-80 gap-2 font-bold"
  onclick={dark}
>
  <iconify-icon
    icon={$theme === "dark" ? "ph:sun-bold" : "ph:moon-stars-bold"}
    width="30"
></iconify-icon>

  {$t(`nav.${$theme === "dark" ? "light" : "dark"}`)}
</button>
