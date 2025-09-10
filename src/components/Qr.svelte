<script>
  import screenfull from "screenfull";
  let { icon, text } = $props();
  let qr = $state();

  let src = `/qr/${encodeURIComponent(text)}`;
  if (icon) src += `/${icon}`;
  else src += "/raw";
</script>

<div
  class="w-72 sm:w-80 mx-auto cursor-pointer"
  bind:this={qr}
  onclick={() => screenfull.toggle(qr)}
  onkeydown={() => screenfull.toggle(qr)}
>
  <img {src} class="mx-auto" alt="QR Code" />
</div>
