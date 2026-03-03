<script lang="ts">
  let { icon = "", text }: any = $props();
  let qr = $state();

  const toggleFullscreen = (el) =>
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();

  let src = $derived.by(() => {
    let url = `/qr/${encodeURIComponent(text)}`;
    if (icon) url += `/${icon}`;
    else url += "/raw";
    return url;
  });
</script>

<div
  class="w-72 sm:w-80 mx-auto cursor-pointer"
  bind:this={qr}
  onclick={() => toggleFullscreen(qr)}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && toggleFullscreen(qr)}
  role="button"
  tabindex="0"
  aria-label="Toggle fullscreen QR"
>
  <img {src} class="mx-auto" alt="QR Code" />
</div>
