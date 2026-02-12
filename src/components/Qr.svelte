<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  let { icon, text } = $props();
  let qr = $state();
  let screenfull;

  onMount(async () => {
    if (!browser) return;
    screenfull = (await import("screenfull")).default;
  });

  let src = $derived(() => {
    let url = `/qr/${encodeURIComponent(text)}`;
    if (icon) url += `/${icon}`;
    else url += "/raw";
    return url;
  });
</script>

<div
  class="w-72 sm:w-80 mx-auto cursor-pointer"
  bind:this={qr}
  onclick={() => screenfull?.toggle?.(qr)}
  onkeydown={(e) =>
    (e.key === "Enter" || e.key === " ") && screenfull?.toggle?.(qr)}
  role="button"
  tabindex="0"
  aria-label="Toggle fullscreen QR"
>
  <img {src} class="mx-auto" alt="QR Code" />
</div>
