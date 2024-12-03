<script>
  import screenfull from "screenfull";
  let { text } = $props();
  let qr = $state();
</script>

<div
  class="w-80 mx-auto cursor-pointer"
  bind:this={qr}
  onclick={() => screenfull.toggle(qr)}
  onkeydown={() => screenfull.toggle(qr)}
>
  <img
    src={`/qr/${encodeURIComponent(text)}/raw`}
    class="mx-auto"
    alt="QR Code"
  />
</div>
