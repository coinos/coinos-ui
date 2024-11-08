<script>
  import screenfull from "screenfull";
  let { src } = $props();
  let qr = $state();
</script>

<div
  class="w-80 mx-auto cursor-pointer"
  bind:this={qr}
  onclick={() => screenfull.toggle(qr)}
  onkeydown={() => screenfull.toggle(qr)}
>
  <img {src} class="mx-auto" alt="QR Code" />
</div>
